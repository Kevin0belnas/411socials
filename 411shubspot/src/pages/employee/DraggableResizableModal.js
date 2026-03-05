import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa';

const DraggableResizableModal = ({ 
  children, 
  onClose, 
  title, 
  subtitle,
  initialWidth = 800,
  initialHeight = 600,
  minWidth = 400,
  minHeight = 300
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth/2 - initialWidth/2, y: 100 });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const modalRef = useRef(null);
  const isFullscreen = useRef(false);
  const originalSize = useRef(null);
  const originalPosition = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
      return;
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeMouseDown = (direction) => (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (isResizing) {
      const newSize = { ...size };
      const newPosition = { ...position };

      if (resizeDirection.includes('e')) {
        newSize.width = Math.max(minWidth, e.clientX - position.x);
      }
      if (resizeDirection.includes('s')) {
        newSize.height = Math.max(minHeight, e.clientY - position.y);
      }
      if (resizeDirection.includes('w')) {
        const widthChange = position.x - e.clientX;
        newSize.width = Math.max(minWidth, size.width + widthChange);
        if (newSize.width > minWidth) {
          newPosition.x = e.clientX;
        }
      }
      if (resizeDirection.includes('n')) {
        const heightChange = position.y - e.clientY;
        newSize.height = Math.max(minHeight, size.height + heightChange);
        if (newSize.height > minHeight) {
          newPosition.y = e.clientY;
        }
      }

      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen.current) {
      // Save original size and position
      originalSize.current = { ...size };
      originalPosition.current = { ...position };
      
      // Go fullscreen
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
      isFullscreen.current = true;
    } else {
      // Restore original size and position
      setPosition(originalPosition.current);
      setSize(originalSize.current);
      isFullscreen.current = false;
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeDirection]);

  return (
    <div className="fixed inset-0 z-[1001] pointer-events-none">
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          maxWidth: `${window.innerWidth}px`,
          maxHeight: `${window.innerHeight}px`,
        }}
      >
        {/* Header - Draggable area */}
        <div 
          className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title={isFullscreen.current ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen.current ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Resize handles */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {/* Top */}
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
            onMouseDown={handleResizeMouseDown('n')}
          />
          {/* Right */}
          <div
            className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={handleResizeMouseDown('e')}
          />
          {/* Bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
            onMouseDown={handleResizeMouseDown('s')}
          />
          {/* Left */}
          <div
            className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={handleResizeMouseDown('w')}
          />
          {/* Top-Right */}
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={handleResizeMouseDown('ne')}
          />
          {/* Bottom-Right */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown('se')}
          />
          {/* Bottom-Left */}
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={handleResizeMouseDown('sw')}
          />
          {/* Top-Left */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown('nw')}
          />
        </div>
      </div>
    </div>
  );
};