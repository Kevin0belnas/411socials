// const usePersonalizedBlockScreenshots = () => {
//     const [personalizedBlockScreenshots, setPersonalizedBlockScreenshots] = useState([]);

//     useEffect(() => {
//         const fetchPersonalizedBlockScreenshots = async () => {
//             try {
//                 const response = await axios.get('/api/personalized-block-screenshots');
//                 setPersonalizedBlockScreenshots(response.data);
//             } catch (error) {
//                 console.error('Error fetching personalized block screenshots:', error);
//             }
//         };

//         fetchPersonalizedBlockScreenshots();
//     }, []);

//     return personalizedBlockScreenshots;
// };