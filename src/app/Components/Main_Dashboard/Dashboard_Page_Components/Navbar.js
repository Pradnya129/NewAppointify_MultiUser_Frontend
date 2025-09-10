'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const Navbar = ({ onToggleSidebar }) => {
  const router = useRouter();
  const handleLogOut=()=>{
    localStorage.removeItem('token');
    router.push('/'); 
  }
useEffect(() => {
  import('../../../../../public/materialize/assets/js/ui-menu.js');
}, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/'); // or your login page
    }
  }, [router]);
  return (
    <div>
         <nav
              className="layout-navbar  container-xxl navbar navbar-expand-xl navbar-detached  align-items-center bg-navbar-theme"
              id="layout-navbar"
            >
              <div className="layout-menu-toggle layout-menu navbar-nav flex align-items-xl-center  me-xl-0 d-xl-none" id="layout-menu">
                <a className="nav-item nav-link px-0 me-xl-6 ms-0" href="#" onClick={(e) => { e.preventDefault(); onToggleSidebar(); }}>
                  <i className="ri-menu-fill ri-22px"></i>
                </a>
              </div>

              <div
                className="navbar-nav-right d-flex justify-items-end align-items-center"
                id="navbar-collapse"
              >
                <ul className="navbar-nav flex-row align-items-center ms-auto">
                  <li className="nav-item dropdown-language dropdown">
                    <a
                      className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      href="#"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ri-translate-2 ri-22px"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-language="en"
                          data-text-direction="ltr"
                        >
                          <span className="align-middle">English</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-language="fr"
                          data-text-direction="ltr"
                        >
                          <span className="align-middle">French</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-language="ar"
                          data-text-direction="rtl"
                        >
                          <span className="align-middle">Arabic</span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-language="de"
                          data-text-direction="ltr"
                        >
                          <span className="align-middle">German</span>
                        </a>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item dropdown-style-switcher dropdown me-1 me-xl-0">
                    <a
                      className="nav-link btn btn-text-secondary rounded-pill text-center btn-icon dropdown-toggle hide-arrow"
                      href="#"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ri-sun-line ri-22px me-3"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end dropdown-styles">
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-theme="light"
                        >
                          <span className="align-middle">
                            <i className="ri-sun-line ri-22px me-3"></i>Light
                          </span>
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#" data-theme="dark">
                          <span className="align-middle">
                            <i className="ri-moon-clear-line ri-22px me-3"></i>
                            Dark
                          </span>
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          data-theme="system"
                        >
                          <span className="align-middle">
                            <i className="ri-computer-line ri-22px me-3"></i>
                            System
                          </span>
                        </a>
                      </li>
                    </ul>
                  </li>

                 

                  <li className="nav-item dropdown-notifications navbar-dropdown dropdown me-4 me-xl-1">
                    <a
                      className="nav-link btn btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow"
                      href="#"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                      aria-expanded="false"
                    >
                      <i className="ri-notification-2-line ri-22px"></i>
                      <span className="position-absolute top-0 start-50 translate-middle-y badge badge-dot bg-danger mt-2 border"></span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end py-0">
                      <li className="dropdown-menu-header border-bottom py-50">
                        <div className="dropdown-header d-flex align-items-center py-2">
                          <h6 className="mb-0 me-auto">Notification</h6>
                          <div className="d-flex align-items-center">
                            <span className="badge rounded-pill bg-label-primary fs-xsmall me-2">
                              8 New
                            </span>
                            <a
                              href="#"
                              className="btn btn-text-secondary rounded-pill btn-icon dropdown-notifications-all"
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                              title="Mark all as read"
                            >
                              <i className="ri-mail-open-line text-heading ri-20px"></i>
                            </a>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item navbar-dropdown dropdown-user dropdown">
                    <a
                      className="nav-link dropdown-toggle hide-arrow"
                      href="#"
                      data-bs-toggle="dropdown"
                    >
                      <div className="avatar avatar-online">
                        <img
                          src="/assets/img/160x160/img8.jpg"
                          alt="User"
                          className="rounded-circle"
                        />

                        {/* <img src="" alt="" /> */}
                      </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <a className="dropdown-item" href="./Security.html">
                          <div className="d-flex">
                            <div className="flex-shrink-0 me-2">
                              <div className="avatar avatar-online">
                                <img
                                  src="/assets/img/160x160/img8.jpg"
                                  alt="User"
                                  className="rounded-circle"
                                />
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <span className="fw-medium d-block small">
                                Dr. Riya Mehta
                              </span>
                              <small className="text-muted">Admin</small>
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          href="/Dashboard/Profile"
                        >
                          <i className="ri-user-3-line ri-22px me-3"></i>
                          <span className="align-middle">My Profile</span>
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/Dashboard/Security">
                          <i className="ri-settings-4-line ri-22px me-3"></i>
                          <span className="align-middle">Security</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          href="/Dashboard/Billing"
                        >
                          <span className="d-flex align-items-center align-middle">
                            <i className="flex-shrink-0 ri-file-text-line ri-22px me-3"></i>
                            <span className="flex-grow-1 align-middle">
                              Billing
                            </span>
                            <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger">
                              4
                            </span>
                          </span>
                        </Link>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                      </li>

                      <li>
                        <a className="dropdown-item" href="pages-faq.html">
                          <i className="ri-question-line ri-22px me-3"></i>
                          <span className="align-middle">FAQ</span>
                        </a>
                      </li>
                      <li>
                        <div className="d-grid px-4 pt-2 pb-1">
                          <a
                            className="btn btn-sm btn-danger d-flex"
                            target="_blank"
                          >
                            <small className="align-middle" onClick={handleLogOut}>Logout</small>
                            <i className="ri-logout-box-r-line ms-2 ri-16px"></i>
                          </a>
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="navbar-search-wrapper search-input-wrapper d-none">
                <input
                  type="text"
                  className="form-control search-input container-xxl border-0"
                  placeholder="Search..."
                  aria-label="Search..."
                />
                <i className="ri-close-fill search-toggler cursor-pointer"></i>
              </div>
            </nav>
    </div>
  )
}

export default Navbar
