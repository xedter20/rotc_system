import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

import StudentRegistration from '../../features/loanApplication';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Loan Application' }));
  }, []);

  return <StudentRegistration />;
}

export default InternalPage;
