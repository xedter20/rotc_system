import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_LoanApplication } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

import PlayCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import {
  mdiAccount,
  mdiBallotOutline,
  mdiGithub,
  mdiMail,
  mdiUpload,
  mdiAccountPlusOutline,
  mdiPhone,
  mdiLock,
  mdiVanityLight,
  mdiLockOutline,
  mdiCalendarRange,
  mdiPhoneOutline,
  mdiMapMarker,
  mdiEmailCheckOutline,
  mdiAccountHeartOutline,
  mdiCashCheck,
  mdiAccountCreditCardOutline,
  mdiCreditCardOutline
} from '@mdi/js';
import 'react-tooltip/dist/react-tooltip.css'
// import Tooltip from 'react-tooltip';
import { Tooltip } from 'react-tooltip';
import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../../components/Input/InputText';
import TextAreaInput from '../../components/Input/TextAreaInput';
import Dropdown from '../../components/Input/Dropdown';
import Radio from '../../components/Input/Radio';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import FormWizard from 'react-form-wizard-component';
import 'react-form-wizard-component/dist/style.css';

import { useDropzone } from "react-dropzone";
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';

import { FaCheckCircle } from "react-icons/fa"; // Font Awesome icon




import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import LoanCalculator from "./loanCalculator";
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';
const TopSideButtons = ({ removeFilter, applyFilter, applySearch, myLoanList }) => {
  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];

  const showFiltersAndApply = params => {
    applyFilter(params);
    setFilterParam(params);
  };

  const removeAppliedFilter = () => {
    removeFilter();
    setFilterParam('');
    setSearchText('');
  };

  useEffect(() => {
    if (searchText === '') {
      removeAppliedFilter();
    } else {
      applySearch(searchText);
    }
  }, [searchText]);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  return (
    <div className="inline-block float-right">
      {/* <SearchBar
        searchText={searchText}
        styleClass="mr-4"
        setSearchText={setSearchText}
      />
      {filterParam != '' && (
        <button
          onClick={() => removeAppliedFilter()}
          className="btn btn-xs mr-2 btn-active btn-ghost normal-case">
          {filterParam}
          <XMarkIcon className="w-4 ml-2" />
        </button>
      )} */}
      <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">Total : {myLoanList.length}</div>

      <button className="btn btn-outline bg-customGreen text-white" onClick={() => document.getElementById('addLoan').showModal()}>
        Add
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>

      {/* 
      <button
        className="btn ml-2 font-bold bg-yellow-500 text-white"
        onClick={() => document.getElementById('my_modal_1').showModal()}>
        Import from file
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button> */}

      {/* <div className="dropdown dropdown-bottom dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-outline">
          <FunnelIcon className="w-5 mr-2" />
          Filter
        </label>
        <ul
          tabIndex={0}
          className="z-40 dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
          {locationFilters.map((l, k) => {
            return (
              <li key={k}>
                <a onClick={() => showFiltersAndApply(l)}>{l}</a>
              </li>
            );
          })}
          <div className="divider mt-0 mb-0"></div>
          <li>
            <a onClick={() => removeAppliedFilter()}>Remove Filter</a>
          </li>
        </ul>
      </div> */}
    </div>
  );
};

function LoanApplication() {


  // Define file handling logic
  const [files, setFiles] = useState({
    borrowerValidID: null,
    bankStatement: null,
    coMakersValidID: null,
  });

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: acceptedFiles[0],
    }));
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const [file, setFile] = useState(null);
  const [faqList, setList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedLoan, setselectedLoan] = useState({});
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();




  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);

  const [myLoanList, setLoanList] = useState([]);

  const loanList = async () => {

    let res = await axios({
      method: 'POST',
      url: 'loan/list',
      data: {

      }
    });
    let list = res.data.data;

    setLoanList(list)


  };

  useEffect(() => {



    loanList()

  }, []);



  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const removeFilter = async () => {
    // let res = await axios({
    //   method: 'POST',
    //   url: 'user/getChildrenList',
    //   data: {
    //     sponsorIdNumber: ''
    //   }
    // });
    // let list = res.data.data;

    // console.log({ list });
    // setList(list);
  };

  const applyFilter = params => {
    let filteredfaqList = faqList.filter(t => {
      return t.address === params;
    });
    setList(filteredfaqList);
  };

  // Search according to name
  const applySearch = value => {
    let filteredUsers = users.filter(t => {
      return (
        t.email.toLowerCase().includes(value.toLowerCase()) ||
        t.firstName.toLowerCase().includes(value.toLowerCase()) ||
        t.lastName.toLowerCase().includes(value.toLowerCase())
      );
    });
    setList(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [

      {
        Header: '#',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },
      {
        Header: 'Full Name',
        accessor: '',
        Cell: ({ row }) => {
          return <span className=""></span>;
        }
      },
      {
        Header: 'Address',
        accessor: '',
        Cell: ({ row }) => {
          return <span className=""></span>;
        }
      },
      {
        Header: 'Cadet Rank',
        accessor: '',
        Cell: ({ row }) => {
          return <span className=""></span>;
        }
      },
      {
        Header: 'Date Created',
        accessor: 'application_date',
        Cell: ({ row, value }) => {
          return <span className="">

            {value &&
              format(value, 'MMM dd, yyyy hh:mm a')}

          </span>;
        }
      },






      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let loan = row.original;



          return (
            (
              <div className="flex">

                {/* <button className="btn btn-outline btn-sm"

                // onClick={() => {
                //   //  console.log({ loan })
                //   // setisEditModalOpen(true)
                //   setselectedLoan(loan);

                //   document.getElementById('viewLoan').showModal();
                //   // setFieldValue('Admin_Fname', 'dex');
                // }}

                >

                  <i class="fa-solid fa-eye"></i>
                </button> */}

                <a
                  href={`loan_details/${loan.loan_id}`} // Replace with the actual URL for the loan details
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <i className="fa-solid fa-eye"></i>
                </a>



                {/* <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.id);

                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button> */}
              </div>
            )
          );
        }
      },

    ],
    []
  );

  const handleOnChange = e => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      let res = await axios({
        // headers: {
        //   'content-type': 'multipart/form-data'
        // },
        method: 'POST',
        url: 'user/uploadFile',
        data
      });

      setIsSubmitting(false);
      fetchFaqList();
      toast.success(`Uploaded Successfully`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      toast.error(`Something went wrong`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      document.getElementById('my_modal_1').close();
    }
  };


  const [currentStep, setCurrentStep] = useState(0);



  const [selectedUser, setSelectedUser] = useState({});



  const getUser = async () => {

    const token = checkAuth();
    const decoded = jwtDecode(token);
    let user_id = decoded.user_id;

    let res = await axios({
      method: 'GET',
      url: `user/${user_id}`
    });
    let user = res.data.data;




    await regions().then(region => {
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });

    await provincesByCode(user.address_region).then(province => {




      setProvince(
        province.map(r => {
          return {
            value: r.province_code,
            label: r.province_name
          };
        })
      );
    });


    await cities(user.address_province).then(cities => {

      setCity(
        cities.map(r => {
          return {
            value: r.city_code,
            label: r.city_name
          };
        })
      );
    });
    await barangays(user.address_city).then(barangays => {
      setBarangay(
        barangays.map(r => {
          return {
            value: r.brgy_code,
            label: r.brgy_name
          };
        })
      );
    });



    setSelectedUser(user);
    setIsLoaded(true)

  };




  useEffect(() => {
    getUser();




    console.log({ selectedUser })
    // prepareAddress(selectedUser)



    // setIsLoaded(true);
    //console.log({ selectedUser: selectedUser });
  }, []);






  const [loanSettings, setLoanSettings] = useState({}); // Changed variable name here



  const fetchloanSettings = async () => {
    try {
      const res = await axios.get(`settings/read/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setLoanSettings(settings); // Changed function call here
    } catch (err) {
      console.error('Error fetching pricing settings:', err); // Log the error
      setError('Failed to fetch pricing settings'); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };

  useEffect(() => {
    fetchloanSettings(); // Changed function call here
  }, []);

  const formikConfig = (selectedUser) => {

    console.log({ selectedUser })




    let PersonalInfoTabValidation = {};

    if (currentStep === 0) {
      PersonalInfoTabValidation = {
        // loan_type: Yup.string()
        //   .required('Required'),
        // first_name: Yup.string()
        //   .required('Required'),

        // middle_name: Yup.string()
        //   .required('Required'),
        // last_name: Yup.string()
        //   .required('Required'),
        // // work: Yup.string()
        // //   .required('Required'),
        // address_region: Yup.string().required('Required field'),
        // address_province: Yup.string().required('Required field'),
        // address_city: Yup.string().required('Required field'),
        // address_barangay: Yup.string().required('Required field'),
        // // streetAddress: Yup.string().required('Required field'),
        // residence_type: Yup.string()
        //   .required('Required')
      }
    }
    else if (currentStep === 1) {


      PersonalInfoTabValidation = {

      }
    }

    else if (currentStep === 3) {
      PersonalInfoTabValidation = {
        calculatorLoanAmmount: Yup.number().required('Required'),
        calculatorInterestRate: Yup.number().required('Required'),
        calculatorMonthsToPay: Yup.number().required('Required'),
      }
    }

    // else if (currentStep === 1) {

    //   console.log("DEx")
    //   PersonalInfoTabValidation = {
    //     borrowerValidID: Yup.string().required("Borrower's Valid ID is required"),
    //     bankStatement: Yup.string().required("Bank Statement is required"),
    //     coMakersValidID: Yup.string().required("Co-maker's Valid ID is required"),
    //   }
    // }




    return {
      initialValues: {

        "loan_type": "",
        first_name: selectedUser.first_name,
        middle_name: selectedUser.middle_name,
        last_name: selectedUser.last_name,
        "work": "",
        "address_region": selectedUser.address_region,
        "address_province": selectedUser.address_province,
        "address_city": selectedUser.address_city,
        "address_barangay": selectedUser.address_barangay,
        "residence_type": "",
        "work_type": "",
        "position": "",
        "status": "",
        "agency_name": "",
        "school_name": "",
        "pensioner": "",
        "monthly_pension": "",
        "loan_type_specific": "",
        "proposed_loan_amount": "",
        "installment_duration": "",
        "loan_security": "",
        "numberField": "",
        "borrowerValidID": null,
        "bankStatement": null,
        "coMakersValidID": null,


        calculatorLoanAmmount: 20000,
        calculatorInterestRate: (loanSettings?.interest_rate || 3),
        calculatorMonthsToPay: 6,
        calculatorTotalAmountToPay: 0,

      },
      validationSchema: Yup.object({
        ...PersonalInfoTabValidation

      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        console.log({ values })



        // console.log("dex submit")



        let res = await axios({
          method: 'post',
          url: `loan/create`,
          data: values
        })



        let loan_application_id = res.data.data.loan_application_id

        const formData = new FormData();
        formData.append('bankStatement', values.bankStatement); // Assuming values contains File objects
        formData.append('borrowerValidID', values.borrowerValidID);
        formData.append('coMakersValidID', values.coMakersValidID);
        formData.append('loan_application_id', loan_application_id);

        await axios({
          // headers: {
          //   'content-type': 'multipart/form-data'
          // },
          method: 'POST',
          url: 'loan/upload-files',
          data: formData
        });

        setSubmitting(false);

        resetForm();
        loanList();
        document.getElementById('addLoan').close();

        toast.success('Successfully created!', {
          onClose: () => {

          },
          position: 'top-right',
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });

        return true

        if (currentStep === 2) {

        }
        try {

          if (selectedLoan.question) {
            let res = await axios({
              method: 'put',
              url: `faq/${selectedLoan.id}`,
              data: values
            })
            document.getElementById('editFaq').close();
            await fetchFaqList();
            resetForm();
            toast.success('Successfully updated!', {
              onClose: () => {

              },
              position: 'top-right',
              autoClose: 500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light'
            });

          } else {
            let res = await axios({
              method: 'POST',
              url: 'faq/create',
              data: values
            })
            document.getElementById('addLoan').close();
            await fetchFaqList();
            resetForm();
            toast.success('Successfully added!', {
              onClose: () => {

              },
              position: 'top-right',
              autoClose: 500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light'
            });

          }



        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };


  const DropzoneArea = ({ fieldName, files, dropzoneProps, setFieldValue, errors }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      ...dropzoneProps,
      onDrop: (acceptedFiles) => {

        setFieldValue(fieldName, acceptedFiles[0]);
        if (acceptedFiles.length > 0) {
          // Update files state with the new file
          setFiles((prevFiles) => ({
            ...prevFiles,
            [fieldName]: acceptedFiles[0],
          }));
        }
      },
    });


    let hasError = errors[fieldName];
    return (
      <div
        {...getRootProps()}
        className={`flex justify-center items-center w-full h-32 p-4 border-2 
       
          ${isDragActive ? "border-blue-500" : "border-gray-300"
          } border-dashed rounded-md text-sm cursor-pointer`}
      >
        <input {...getInputProps()} />
        <div>
          {files[fieldName] ? (
            <p className="text-gray-700">
              {files[fieldName].name} <span className="text-green-500">(Selected)</span>
            </p>
          ) : (
            <p className="text-gray-500">
              Drag and drop a file here, or click to select a file.
            </p>
          )}
        </div>
      </div>
    );
  };



  return (
    isLoaded &&
    <TitleCard
      title="List"
      topMargin="mt-2"
      TopSideButtons={
        <TopSideButtons
          applySearch={applySearch}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
          myLoanList={myLoanList}
        />
      }>
      <div className="">

        <dialog id="addLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg  p-4 
 bg-gradient-to-r from-gray-200 to-gray-100
      z-10 text-customGreen border bg-white
             rounded">New Officer Application</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              {selectedUser.role &&
                <Formik {...formikConfig(selectedUser)}>
                  {({
                    validateForm,
                    handleSubmit,
                    handleChange,
                    handleBlur, // handler for onBlur event of form elements
                    values,
                    touched,
                    errors,
                    submitForm,
                    setFieldTouched,
                    setFieldValue,
                    setFieldError,
                    setErrors,
                    isSubmitting
                  }) => {

                    const PersonalInfo = useMemo(() => (
                      <div>
                        <Form className="">

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Student #"
                              name="student_number"
                              type="text"
                              value={values.student_number} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('student_number', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="MS"
                              name="ms"
                              type="ms"

                              value={values.ms}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />


                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="First Name"
                              name="first_name"
                              type="text"
                              value={values.first_name} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('first_name', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Middle Name"
                              name="middle_name"
                              type="middle_name"

                              value={values.middle_name}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Last Name"
                              name="last_name"
                              type="last_name"

                              value={values.last_name}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>

                          <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                            <Dropdown
                              className="z-50"

                              label="Region"
                              name="address_region"
                              value={values.address_region}

                              onBlur={handleBlur}
                              options={addressRegions}
                              affectedInput="address_province"
                              allValues={values}
                              setFieldValue={setFieldValue}
                              functionToCalled={async regionCode => {
                                if (regionCode) {
                                  setFieldValue('address_province', '');
                                  await provincesByCode(regionCode).then(
                                    province => {
                                      setProvince(
                                        province.map(p => {
                                          return {
                                            value: p.province_code,
                                            label: p.province_name
                                          };
                                        })
                                      );
                                    }
                                  );
                                }
                              }}
                            />

                            <Dropdown
                              className="z-50"

                              label="Province"
                              name="address_province"
                              value={values.address_province}
                              d
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressProvince}
                              affectedInput="address_city"
                              functionToCalled={async code => {
                                if (code) {
                                  await cities(code).then(cities => {
                                    setCity(
                                      cities.map(p => {
                                        return {
                                          value: p.city_code,
                                          label: p.city_name
                                        };
                                      })
                                    );
                                  });
                                }
                              }}
                            />
                            <Dropdown
                              className="z-50"

                              label="City"
                              name="address_city"
                              // value={values.civilStatus}
                              setFieldValue={setFieldValue}
                              onBlur={handleBlur}
                              options={addressCity}
                              affectedInput="address_barangay"
                              functionToCalled={async code => {
                                if (code) {
                                  await barangays(code).then(cities => {
                                    setBarangay(
                                      cities.map(p => {
                                        console.log({ p });
                                        return {
                                          value: p.brgy_code,
                                          label: p.brgy_name
                                        };
                                      })
                                    );
                                  });
                                }
                              }}
                            />
                            <Dropdown
                              className="z-50"

                              label="Barangay"
                              name="address_barangay"
                              value={values.address_barangay}

                              onBlur={handleBlur}
                              options={addressBarangay}
                              affectedInput=""
                              functionToCalled={async code => { }}
                              setFieldValue={setFieldValue}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Course"
                              name="course"
                              type="text"
                              value={values.course} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('course', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="School"
                              name="school"
                              type="school"

                              value={values.school}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Religion"
                              name="religion"
                              type="religion"

                              value={values.religion}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Date of Birth"
                              name="birth_date"
                              type="date"
                              value={values.course} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('birth_date', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Place of Birth"
                              name="birth_place"
                              type="birth_place"

                              value={values.birth_place}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Height"
                              name="height"
                              type="text"
                              value={values.height} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('height', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Weight"
                              name="weight"
                              type="text"
                              value={values.weight} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('weight', e.target.value); // Use the input value
                              }}
                            />
                            <InputText
                              isRequired
                              placeholder=""
                              label="Complexion"
                              name="complexion"
                              type="text"
                              value={values.complexion} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('complexion', e.target.value); // Use the input value
                              }}
                            /> <InputText
                              isRequired
                              placeholder=""
                              label="Blood Type"
                              name="blood_type"
                              type="text"
                              value={values.blood_type} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('blood_type', e.target.value); // Use the input value
                              }}
                            />

                          </div>
                          <Radio
                            isRequired
                            label="Are you willing to take advance course?"
                            name="loan_type" // This should be "loan_type"
                            value={values.loan_type}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              { value: 'Yes', label: 'Yes' },
                              { value: 'No', label: 'No' }
                            ]}
                          />
                        </Form>
                      </div>
                    ), [currentStep, errors, values, addressRegions, addressProvince, addressCity, addressBarangay]);


                    const AccountDetails = useMemo(() => (
                      <div>


                        <Form className="">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Father's Name"
                              name="fathers_name"
                              type="text"
                              value={values.fathers_name} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('fathers_name', e.target.value); // Use the input value
                              }}
                            />

                            <InputText
                              isRequired
                              placeholder=""
                              label="Occupation"
                              name="fathers_occupation"
                              type="fathers_occupation"

                              value={values.fathers_occupation}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Mother's Name"
                              name="mothers_name"
                              type="text"
                              value={values.mothers_name} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('mothers_name', e.target.value); // Use the input value
                              }}
                            />

                            <InputText
                              isRequired
                              placeholder=""
                              label="Occupation"
                              name="fathers_occupation"
                              type="fathers_occupation"

                              value={values.fathers_occupation}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Emergency Contact Name"
                              name="emergeny_contact_name"
                              type="text"
                              value={values.emergeny_contact_name} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('emergeny_contact_name', e.target.value); // Use the input value
                              }}
                            />

                            <InputText
                              isRequired
                              placeholder=""
                              label="Relationship"
                              name="relationship"
                              type="relationship"

                              value={values.relationship}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                            <InputText
                              isRequired
                              placeholder=""
                              label="Address"
                              name="address"
                              type="text"
                              value={values.address} // Bind value to Formik state
                              onBlur={handleBlur}
                              onChange={(e) => {

                                console.log(e.target.value)
                                setFieldValue('address', e.target.value); // Use the input value
                              }}
                            />

                            <InputText
                              isRequired
                              placeholder=""
                              label="Mobile Number"
                              name="mobile_number"
                              type="number"

                              value={values.mobile_number}
                              onBlur={handleBlur} // This apparently updates `touched`?
                            />

                          </div>
                        </Form>
                      </div>
                    ), [currentStep, errors, values]);



                    const SupportingDocuments = () => {

                      let hasError1 = errors['borrowerValidID'];
                      let hasError2 = errors['bankStatement'];
                      let hasError3 = errors['coMakersValidID'];
                      return (
                        <div className="space-y-4">
                          {/* Borrower's Valid ID */}
                          <h1 className="font-bold text-lg text-center">Upload</h1>
                          <div

                            className={`${hasError1 ? "space-y-4 p-4 border-2 rounded border-red-500" : ""
                              }`}>


                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Valid ID
                            </label>
                            <DropzoneArea
                              fieldName="borrowerValidID"
                              files={files}
                              dropzoneProps={dropzoneProps("borrowerValidID")}
                              setFieldValue={setFieldValue}
                              errors={errors}
                            />
                            {errors.borrowerValidID && <p className="text-red-500 text-sm mt-2">{errors.borrowerValidID}</p>}
                          </div>





                          {/* Submit */}
                          {/* <button
                          type="button"
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            console.log({ files })



                          }}
                        >
                          Submit
                        </button> */}
                        </div>
                      );

                    };








                    const Confirmation = () => {
                      const [isVisible, setIsVisible] = useState(true);
                      const [isChecked, setIsChecked] = useState(false);

                      const closeAlert = () => {
                        if (isChecked) {
                          setIsVisible(false);
                        } else {
                          alert("You must agree to the terms and conditions before proceeding.");
                        }
                      };
                      return <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">Note</h3>
                            <p className="mt-2">Collateral is required for bigger loan amount (such as land title, house and lot, and the likes)</p>
                          </div>
                          <button

                            className="text-yellow-700 hover:text-yellow-900 font-semibold"
                          >

                          </button>
                        </div>
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                            className="h-5 w-5 text-blue-500"
                          />
                          <label htmlFor="terms" className="ml-2 text-smf text-gray-700">
                            I further certify that the cited information’s are the best of my knowledge tru, correct, and voluntary
                          </label>
                        </div>
                      </div>
                    }

                    const steps = [

                      {
                        label: 'Personal Information', content: () => {
                          return PersonalInfo
                        }
                      },
                      {
                        label: 'Emergency Contact', content: () => {
                          return AccountDetails
                        }
                      },
                      {
                        label: 'Valid IDs', content: () => {
                          return <SupportingDocuments />
                        }
                      },

                    ];

                    const nextStep = async () => {

                      // setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                      // return true;
                      const formErrors = await validateForm();



                      console.log({ currentStep })

                      if (currentStep === 2) {
                        const validateFields = (fields, setFieldError) => {
                          const fieldErrors = {
                            borrowerValidID: "Borrower's Valid ID is required",
                            bankStatement: "Bank Statement is required",
                            coMakersValidID: "Co-maker's Valid ID is required",
                          };

                          // Loop through fields to check and set errors
                          Object.keys(fieldErrors).forEach((field) => {
                            if (!fields[field]) {
                              setFieldError(field, fieldErrors[field]);
                            }
                          });
                        };


                        let { borrowerValidID, bankStatement, coMakersValidID } = values;
                        if (!borrowerValidID || !bankStatement || !coMakersValidID) {

                          validateFields({ borrowerValidID, bankStatement, coMakersValidID }, setFieldError);


                          return true


                        }
                        else {
                          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                        }
                      } else {
                        // Dynamically set errors using setFieldError
                        for (const [field, error] of Object.entries(formErrors)) {

                          setFieldTouched(field, true); // Mark field as touched
                          setFieldError(field, error); // Set error for each field dynamically
                        }

                        if (Object.keys(formErrors).length === 0) {
                          //  handleSubmit(); // Only proceed to next step if there are no errors
                          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                        }
                      }





                    };

                    const prevStep = () => {
                      setCurrentStep((prev) => Math.max(prev - 1, 0));
                    };

                    // const stepContent = useMemo(() => steps[currentStep].content(), [currentStep]);



                    return (
                      <div>
                        <div className="mt-4">
                          <div className="">
                            {/* Step Navigation Menu */}
                            <div className="flex justify-between mb-4">
                              {steps.map((step, index) => (
                                <div
                                  key={index}
                                  className={`cursor-pointer text-center flex-1 ${currentStep === index ? 'text-customGreen  font-bold' : 'text-gray-400'
                                    }`}
                                  onClick={() => index <= currentStep && setCurrentStep(index)}
                                >
                                  <span>{step.label}</span>
                                  <div
                                    className={`mt-2 h-1 rounded ${currentStep === index ? 'bg-customGreen' : 'bg-transparent'
                                      }`}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* <h2 className="text-xl font-bold mb-4">{steps[currentStep].label}</h2> */}


                            {steps[currentStep].content()}
                            <div className="flex justify-between mt-4">
                              {currentStep > 0 && (
                                <button onClick={prevStep}
                                  className="btn  bg-gray-200 text-black">
                                  Previous
                                </button>
                              )}
                              {currentStep < steps.length - 1 ? (
                                <button onClick={nextStep} className="btn bg-customGreen text-white">
                                  Next
                                </button>
                              ) : (
                                <button

                                  onClick={handleSubmit}

                                  disabled={isSubmitting}

                                  className="btn btn-success bg-customGreen text-white">

                                  {isSubmitting ? (
                                    <span className="w-4 h-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mr-2"></span>

                                  ) : (
                                    "" // Default text
                                  )}
                                  Submit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  }}
                </Formik>
              } </div>
          </div>
        </dialog >


        <dialog id="viewLoan" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setselectedLoan({})
                document.getElementById("viewLoan").close()
              }}


            >✕</button>

            <div className="modal-header flex items-center justify-between p-4 bg-gradient-to-r from-gray-200 to-gray-300
      z-10 text-blue-950 border bg-white text-blue-950  rounded-t-lg">
              <h1 className="text-xl font-bold">Loan Details</h1>

            </div>

            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <StatusPill value={selectedLoan.loan_status} />
              {selectedLoan.loan_application_id && <Formik
                initialValues={{
                  calculatorLoanAmmount: parseFloat(selectedLoan.loan_amount),
                  calculatorInterestRate: parseFloat(selectedLoan.interest_rate),
                  calculatorMonthsToPay: parseFloat(selectedLoan.repayment_schedule_id),
                  loan_status: selectedLoan.loan_status
                }}
              >
                {({
                  validateForm,
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting
                }) => {



                  return <LoanCalculator
                    selectedLoan={selectedLoan}
                    isReadOnly={true}
                    values={values}
                    setFieldValue={setFieldValue}
                    handleBlur={handleBlur}
                    calculatorLoanAmmount={values.calculatorLoanAmmount}
                    calculatorInterestRate={values.calculatorInterestRate}
                    calculatorMonthsToPay={values.calculatorMonthsToPay}
                    calculatorTotalAmountToPay={values.calculatorTotalAmountToPay}
                  />


                }}</Formik>
              }

            </div>
          </div>
        </dialog >
        <Table
          style={{ overflow: 'wrap' }}
          className="table-sm"
          columns={columns}
          data={(myLoanList || []).map(data => {
            return {
              ...data

            };
          })}
          searchField="lastName"
        />
      </div >

      <ToastContainer />









    </TitleCard >

  );
}

export default LoanApplication;
