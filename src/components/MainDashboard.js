import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MainDashboard = () => {
  const { user, socket, API_BASE_URL } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    activeAssignments: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on('booking_update', (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'booking',
          message: data.message,
          timestamp: new Date()
        }, ...prev.slice(0, 4)]);
        
        loadDashboardData(); // Refresh data
      });

      socket.on('new_booking', (data) => {
        if (user?.role === 'Driver') {
          setNotifications(prev => [{
            id: Date.now(),
            type: 'booking',
            message: 'New booking request received!',
            timestamp: new Date()
          }, ...prev.slice(0, 4)]);
          
          loadDashboardData();
        }
      });

      return () => {
        socket.off('booking_update');
        socket.off('new_booking');
      };
    }
  }, [socket, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`);
      const bookings = bookingsResponse.data.bookings;
      
      // Calculate stats
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      
      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        activeAssignments: 0 // Will be updated when assignments API is available
      });
      
      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDashboardCards = () => {
    if (user?.role === 'OKU User') {
      return [
        { title: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: 'bg-blue-500', link: '/bookings' },
        { title: 'Pending Requests', value: stats.pendingBookings, icon: '⏳', color: 'bg-yellow-500', link: '/bookings' },
        { title: 'Completed Trips', value: stats.completedBookings, icon: '✅', color: 'bg-green-500', link: '/bookings' },
        { title: 'Live Tracking', value: 'View Map', icon: '🗺️', color: 'bg-purple-500', link: '/map' }
      ];
    }
    
    if (user?.role === 'Driver') {
      return [
        { title: 'Total Requests', value: stats.totalBookings, icon: '📅', color: 'bg-blue-500', link: '/bookings' },
        { title: 'Pending Approval', value: stats.pendingBookings, icon: '⏳', color: 'bg-yellow-500', link: '/bookings' },
        { title: 'Completed Trips', value: stats.completedBookings, icon: '✅', color: 'bg-green-500', link: '/bookings' },
        { title: 'Share Location', value: 'GPS Map', icon: '📍', color: 'bg-red-500', link: '/map' }
      ];
    }
    
    if (['Company Admin', 'JKM Officer'].includes(user?.role)) {
      return [
        { title: 'Total Bookings', value: stats.totalBookings, icon: '📊', color: 'bg-blue-500', link: '/bookings' },
        { title: 'Active Drivers', value: stats.activeAssignments, icon: '🚗', color: 'bg-green-500', link: '/admin' },
        { title: 'Pending Approvals', value: stats.pendingBookings, icon: '⏳', color: 'bg-yellow-500', link: '/admin' },
        { title: 'System Monitor', value: 'Live Map', icon: '🗺️', color: 'bg-purple-500', link: '/map' }
      ];
    }
    
    return [];
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to your {user?.role} dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getDashboardCards().map((card, index) => (
          <Link key={index} to={card.link} className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-l-gray-200 hover:border-l-blue-500">
              <div className="flex items-center">
                <div className={`${card.color} text-white p-3 rounded-lg mr-4`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof card.value === 'number' ? card.value : card.value}
                  </p>
                  <p className="text-sm text-gray-600">{card.title}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">📋</span> Recent Bookings
            </h2>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings yet</p>
                <Link 
                  to="/bookings" 
                  className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  Create your first booking →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {user?.role === 'Driver' ? booking.oku_name : booking.driver_name}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.start_datetime).toLocaleDateString()} - {booking.pickup_location} → {booking.dropoff_location}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Link 
                  to="/bookings"
                  className="block text-center text-blue-600 hover:text-blue-800 mt-4"
                >
                  View all bookings →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">⚡</span> Quick Actions
            </h2>
            
            <div className="space-y-3">
              {user?.role === 'OKU User' && (
                <>
                  <Link 
                    to="/bookings" 
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🚐 Book Transport
                  </Link>
                  <Link 
                    to="/map" 
                    className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    🗺️ Track Drivers
                  </Link>
                </>
              )}
              
              {user?.role === 'Driver' && (
                <>
                  <Link 
                    to="/bookings" 
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    📅 View Requests
                  </Link>
                  <Link 
                    to="/map" 
                    className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    📍 Share Location
                  </Link>
                </>
              )}
              
              {['Company Admin', 'JKM Officer'].includes(user?.role) && (
                <>
                  <Link 
                    to="/admin" 
                    className="block w-full bg-purple-600 text-white text-center py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    ⚙️ Admin Panel
                  </Link>
                  <Link 
                    to="/map" 
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🗺️ Monitor System
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🔔</span> Recent Updates
            </h2>
            
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;