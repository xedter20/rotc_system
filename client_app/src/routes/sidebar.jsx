import axios from 'axios';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import {
  Squares2X2Icon,
  UsersIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  CogIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const iconClasses = 'h-6 w-6';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarSubmenu from '../containers/SidebarSubmenu';

const AppRoutes = () => {
  const [accountSettings, setAccountSettings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const location = useLocation();

  const fetchAccountSettings = async () => {
    try {
      const token = checkAuth();
      const decoded = jwtDecode(token);
      let role = decoded.role;

      setSelectedUserId(decoded.user_id);
      setIsLoaded(true);

      const newRoutes = [];

      // Define route paths and corresponding icons dynamically
      const routeDetails = [
        { path: '/app/dashboard', name: 'Dashboard', icon: <Squares2X2Icon className={iconClasses} /> },
        { path: '/app/students', name: 'Students', icon: <UsersIcon className={iconClasses} /> },
        { path: '/app/attendance', name: 'Attendance', icon: <PresentationChartLineIcon className={iconClasses} /> },
        { path: '/app/activities', name: 'Activities', icon: <BanknotesIcon className={iconClasses} /> },
        { path: '/app/achivements', name: 'Achievements', icon: <DocumentChartBarIcon className={iconClasses} /> },
        { path: '/app/scholar', name: 'Scholars', icon: <IdentificationIcon className={iconClasses} /> },
        { path: '/app/volunteers', name: 'Volunteers', icon: <QuestionMarkCircleIcon className={iconClasses} /> },
        { path: '/app/settings', name: 'Settings', icon: <CogIcon className={iconClasses} /> }
      ];

      // Add routes based on role if needed (example)
      routeDetails.forEach(route => {
        newRoutes.push({
          path: route.path,
          icon: route.icon,
          name: route.name,
        });
      });

      setRoutes(newRoutes);
    } catch (error) {
      console.error('Error fetching account settings:', error);
    }
  };

  useEffect(() => {
    fetchAccountSettings();
  }, [selectedUserId]);

  return isLoaded && (
    <div>
      {
        routes.map((route, k) => (
          <li className="p-2 text-center" key={k}>
            {route.submenu ? (
              <SidebarSubmenu {...route} />
            ) : (
              <NavLink
                end
                to={route.path}
                className={({ isActive }) =>
                  `${isActive ? 'font-bold text-white shadow-2xl border-2 border-white' : 'border-2 border-transparent'}`
                }>
                {route.icon} {route.name}
                {location.pathname === route.path ? (
                  <span
                    className="absolute inset-y-0 left-0 w-2 rounded-tr-md rounded-br-md"
                    aria-hidden="true"></span>
                ) : null}
              </NavLink>
            )}
          </li>
        ))
      }
    </div>
  );
};

export default AppRoutes;
