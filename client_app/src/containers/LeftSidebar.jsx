import React, { useEffect, useState } from 'react';
import RoutesSideBar from '../routes/sidebar';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
function LeftSidebar() {
  const location = useLocation();

  const dispatch = useDispatch();

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [selectedUser, setSelectedUser] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);

  // console.log({ loggedInUser })
  let userId = loggedInUser.userId;
  const getUser = async () => {

    const token = checkAuth();
    const decoded = jwtDecode(token);
    let user_id = decoded.user_id;

    let res = await axios({
      method: 'GET',
      url: `user/${userId}`
    });
    let user = res.data.data;



    setSelectedUser(user);
    setIsLoaded(true);
  };




  useEffect(() => {
    getUser();
    //console.log({ selectedUser: selectedUser });
  }, []);

  const close = e => {
    document.getElementById('left-sidebar-drawer').click();
  };

  // console.log({ selectedUser })

  return isLoaded && (

    <div className="drawer-side text-white bg-customGreen h-screen w-60">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      {/* <div className=" mx-auto flex items-center justify-center mb-8 mt-4">
        <img src="/A.V. Logo.png" alt="Logo" className="w-30 h-24" />
      </div> */}
      {/* <hr class="border-t-2 border-white mx-auto w-1/2 my-2"></hr> */}
      <div className=" mx-auto flex items-center justify-center mb-3 mt-6">
        <img
          src={selectedUser?.profile_pic || 'https://cdn-icons-png.freepik.com/512/18028/18028934.png?ga=GA1.1.1710848127.1724072387'}
          alt="Logo"
          className="w-24 h-24 rounded-full"
        />
      </div>

      <ul className="menu bg-customGreen text-white items-center justify-between mx-auto ">
        <button
          className="btn btn-ghost bg-base-300 btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
          onClick={() => close()}>
          <XMarkIcon className="h-5 w-5" />
        </button>

        {selectedUser && (
          <li className="flex items-center justify-between mb-3">
            <label className="text-white">
              Hello, <span className="font-bold">{selectedUser.first_name} {selectedUser.last_name}</span>
            </label>
          </li>
        )}

        <RoutesSideBar />
      </ul>
    </div>
  );
}

export default LeftSidebar;
