import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, LinearProgress, Select, MenuItem,
  TextField, InputAdornment, IconButton, CircularProgress, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Badge, Tabs, Tab
} from '@mui/material';
import {
  Search, FilterList, Refresh, ArrowDropDown, CheckCircle,
  Error, AccessTime, PeopleAlt, TrendingUp, DoneAll, Close,
  BarChart as BarChartIcon, Comment, DateRange
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
const API_URL = import.meta.env.VITE_API_URL;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 2, bgcolor: `${color}20`, border: `1px solid ${color}40` }}>
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color
      }}>
        {React.cloneElement(icon, { fontSize: 'medium' })}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        <Typography variant="h5">{value}</Typography>
      </Box>
    </Paper>
  );
}

function EfficiencyBadge({ value }) {
  let color = 'success';
  if (value < 70) color = 'warning';
  if (value < 50) color = 'error';

  return (
    <Chip
      label={`${value}%`}
      color={color}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
}

function StatusIndicator({ status }) {
  let icon;
  let color;

  if (!status) {
    status = 'Unknown';
  }

  switch (status.toLowerCase()) {
    case 'new':
      icon = <AccessTime fontSize="small" />;
      color = 'default';
      break;
    case 'contacted':
      icon = <CheckCircle fontSize="small" />;
      color = 'primary';
      break;
    case 'in progress':
    case 'in_progress':
      icon = <TrendingUp fontSize="small" />;
      color = 'warning';
      break;
    case 'completed':
      icon = <DoneAll fontSize="small" />;
      color = 'success';
      break;
    case 'closed':
      icon = <Error fontSize="small" />;
      color = 'error';
      break;
    default:
      icon = <AccessTime fontSize="small" />;
      color = 'default';
  }

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
}

function Dashboard() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgEfficiency: 0,
    tasksCompleted: 0
  });
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [leads, setLeads] = useState([]);
  const [transactions, setTransactions] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
      document.title = "411 Socials CRM";
    }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/performance`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected an array but got:', data);
        setAgents([]);
        setStats({
          total: 0,
          active: 0,
          avgEfficiency: 0,
          tasksCompleted: 0
        });
        return;
      }

      setAgents(data);

      const activeCount = data.filter(a => a.status === 'In Progress').length;
      const totalTasksCompleted = data.reduce((sum, a) => sum + parseInt(a.tasksCompleted || 0), 0);
      const avgEfficiency = data.length > 0
        ? data.reduce((sum, a) => sum + a.efficiency, 0) / data.length
        : 0;

      setStats({
        total: data.length,
        active: activeCount,
        avgEfficiency: avgEfficiency,
        tasksCompleted: totalTasksCompleted
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentAnalytics = async (agentIds) => {
    try {
      setLeadsLoading(true);
      setTransactionsLoading(true);
      
      const leadsResponse = await fetch(`${API_URL}/api/agent-leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentIds,
          status: 'all',
          timeFilter,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      const leadsData = await leadsResponse.json();
      setLeads(leadsData);
      
      const transactionsResponse = await fetch(`${API_URL}/api/agent-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentIds,
          timeFilter,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLeadsLoading(false);
      setTransactionsLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!agents.length || selectedAgents.length === 0) return null;

    const selectedAgentData = agents.filter(agent => selectedAgents.includes(agent.id));
    
    return {
      labels: selectedAgentData.map(agent => agent.name),
      datasets: [
        {
          label: 'Efficiency (%)',
          data: selectedAgentData.map(agent => agent.efficiency),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Tasks Completed',
          data: selectedAgentData.map(agent => agent.tasksCompleted),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Tasks',
          data: selectedAgentData.map(agent => agent.totalTasks || 0),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Agent Performance Comparison',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  const handleRefresh = () => {
    fetchData();
    setSelectedAgents([]);
  };

  const handleRowClick = (agentId) => {
    const newSelected = [...selectedAgents];
    const currentIndex = newSelected.indexOf(agentId);
    
    if (currentIndex === -1) {
      newSelected.push(agentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    
    setSelectedAgents(newSelected);
  };

  const handleOpenModal = async () => {
    if (selectedAgents.length === 0) return;
    await fetchAgentAnalytics(selectedAgents);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setLeads([]);
    setTransactions(null);
    setActiveTab(0);
  };

  const handleDateFilterChange = (filter) => {
    setTimeFilter(filter);
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (filter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    setDateRange({ startDate, endDate });
  };

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === 'all' || agent.status === filter;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCounts = () => {
    const counts = {
      Contacted: 0,
      Completed: 0,
      Closed: 0,
      total: leads.length
    };

    leads.forEach(lead => {
      if (Object.prototype.hasOwnProperty.call(counts, lead.status)) {
        counts[lead.status]++;
      }
    });

    return counts;
  };

  const getTransactionStats = () => {
    const stats = {
      totalTransactions: transactions?.length || 0,
      totalRevenue: 0,
      completedPayments: 0,
      pendingPayments: 0
    };

    if (transactions) {
      transactions.forEach(trans => {
        stats.totalRevenue += parseFloat(trans.tot_service_price) || 0;
        if (trans.payment_status === 'Completed') {
          stats.completedPayments++;
        } else {
          stats.pendingPayments++;
        }
      });
    }

    return stats;
  };

  if (loading && agents.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          backgroundColor: '#0B79A1', 
          p: 2, 
          fontWeight: 'bold', 
          borderRadius: 1, 
          color: 'white', 
          fontFamily: 'Times New Roman, Times, serif' 
        }}
      >
        Agent Task Monitoring
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search agents..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          IconComponent={ArrowDropDown}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Converted">Converted</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
        </Select>
        <IconButton>
          <FilterList />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <Badge badgeContent={selectedAgents.length} color="primary">
          <Button 
            variant="contained" 
            onClick={handleOpenModal}
            disabled={selectedAgents.length === 0}
            startIcon={<BarChartIcon />}
          >
            View Analytics
          </Button>
        </Badge>
        <IconButton onClick={handleRefresh}>
          <Refresh />
        </IconButton>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <StatCard title="Total Agents" value={stats.total} icon={<PeopleAlt />} color="#4caf50" />
        <StatCard title="Active Now" value={stats.active} icon={<CheckCircle />} color="#2196f3" />
        <StatCard title="Tasks Completed" value={stats.tasksCompleted} icon={<DoneAll />} color="#9c27b0" />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#0B79A1' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedAgents.length > 0 && selectedAgents.length < filteredAgents.length
                  }
                  checked={
                    filteredAgents.length > 0 && selectedAgents.length === filteredAgents.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAgents(filteredAgents.map(agent => agent.id));
                    } else {
                      setSelectedAgents([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agent</TableCell>
              {/* <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Current Task</TableCell> */}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Progress</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Efficiency</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <TableRow 
                  key={agent.id} 
                  hover 
                  onClick={() => handleRowClick(agent.id)}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedAgents.includes(agent.id) ? '#e3f2fd' : 'inherit'
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAgents.includes(agent.id)}
                      onChange={() => handleRowClick(agent.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: stringToColor(agent.name) }}>
                        {agent.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography>{agent.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{agent.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  {/* <TableCell>
                    <Box
                      sx={{
                        maxHeight: 60,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#ccc',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: '#f0f0f0',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {agent.currentTask}
                      </Typography>
                    </Box>
                  </TableCell> */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {agent.tasksCompleted}/{agent.totalTasks || 1}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(agent.tasksCompleted / (agent.totalTasks || 1)) * 100}
                        sx={{ flexGrow: 1, height: 8 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <EfficiencyBadge value={agent.efficiency} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {agent.lastActive ? new Date(agent.lastActive).toLocaleString() : 'Unknown'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>
                    {searchQuery ? 'No matching agents found' : 'No agents available'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" style={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 'bold' }}>
              Agent Performance Analytics
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(newValue) => setDateRange({...dateRange, startDate: newValue})}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(newValue) => setDateRange({...dateRange, endDate: newValue})}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </LocalizationProvider>
            <Button
              variant={timeFilter === 'today' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateFilterChange('today')}
              startIcon={<DateRange />}
            >
              Today
            </Button>
            <Button
              variant={timeFilter === 'week' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateFilterChange('week')}
              startIcon={<DateRange />}
            >
              This Week
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateFilterChange('month')}
              startIcon={<DateRange />}
            >
              This Month
            </Button>
            <Button
              variant={timeFilter === 'year' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateFilterChange('year')}
              startIcon={<DateRange />}
            >
              This Year
            </Button>
            <Button
              variant={timeFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handleDateFilterChange('all')}
              startIcon={<DateRange />}
            >
              All Time
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => fetchAgentAnalytics(selectedAgents)}
              startIcon={<Refresh />}
              disabled={leadsLoading || transactionsLoading}
            >
              Apply Filters
            </Button>
          </Box>

          {(leadsLoading || transactionsLoading) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Performance Comparison
                </Typography>
                {prepareChartData() ? (
                  <Bar data={prepareChartData()} options={chartOptions} />
                ) : (
                  <Typography>No data available for visualization</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <StatCard 
                  title="Total Leads" 
                  value={getStatusCounts().total} 
                  icon={<PeopleAlt />} 
                  color="#4caf50" 
                />
                <StatCard 
                  title="Contacted" 
                  value={getStatusCounts().Contacted} 
                  icon={<CheckCircle />} 
                  color="#2196f3" 
                />
                <StatCard 
                  title="Completed" 
                  value={getStatusCounts().Completed} 
                  icon={<DoneAll />} 
                  color="#9c27b0" 
                />
                <StatCard 
                  title="Closed" 
                  value={getStatusCounts().Closed} 
                  icon={<Error />} 
                  color="#f44336" 
                />
                {activeTab === 1 && (
                  <>
                    <StatCard 
                      title="Total Revenue" 
                      value={`$${getTransactionStats().totalRevenue.toFixed(2)}`} 
                      icon={<TrendingUp />} 
                      color="#ff9800" 
                    />
                    <StatCard 
                      title="Completed Payments" 
                      value={getTransactionStats().completedPayments} 
                      icon={<CheckCircle />} 
                      color="#4caf50" 
                    />
                    <StatCard 
                      title="Pending Payments" 
                      value={getTransactionStats().pendingPayments} 
                      icon={<AccessTime />} 
                      color="#607d8b" 
                    />
                  </>
                )}
              </Box>

              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Leads" icon={<PeopleAlt />} />
                <Tab label="Transactions" icon={<BarChartIcon />} />
              </Tabs>

              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Lead Name</TableCell>
                          <TableCell>Book Title</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Comments</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leads.length > 0 ? (
                          leads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell>{lead.name}</TableCell>
                              <TableCell>{lead.book_title || '-'}</TableCell>
                              <TableCell>
                                <StatusIndicator status={lead.status} />
                              </TableCell>
                              <TableCell>
                                {lead.comment ? (
                                  <Chip
                                    icon={<Comment />}
                                    label="View Comment"
                                    onClick={() => alert(lead.comment)}
                                    variant="outlined"
                                  />
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                              <Typography>No leads found for the selected criteria</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Transaction ID</TableCell>
                          <TableCell>Service</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Payment Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions && transactions.length > 0 ? (
                          transactions.map((trans) => (
                            <TableRow key={trans.transaction_id || Math.random()}>
                              <TableCell>{trans.transaction_id || '-'}</TableCell>
                              <TableCell>{trans.service_name || '-'}</TableCell>
                              <TableCell>${trans.tot_service_price ? parseFloat(trans.tot_service_price).toFixed(2) : '0.00'}</TableCell>
                              <TableCell>
                                <StatusIndicator status={trans.trans_status} />
                              </TableCell>
                              <TableCell>
                                {trans.transaction_date ? new Date(trans.transaction_date).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={trans.payment_status || 'Unknown'}
                                  color={trans.payment_status === 'Completed' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                              <Typography>
                                {transactions === null ? 'Loading transactions...' : 'No transactions found'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default Dashboard;