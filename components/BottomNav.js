import { CgBell, CgHome, CgMail, CgPin, CgSearch } from 'react-icons/cg';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { motion } from 'framer-motion';

const BottomNav = (e) => {
  const [activePage, setActivePage] = useState('');

  const handlePageChange = (page) => {
    setActivePage(page);
    window.sessionStorage.setItem('activePage', page);
  };

  useEffect(() => {
    const activePage = window.sessionStorage.getItem('activePage');
    if (activePage) {
      setActivePage(activePage);
    }
  }, []);

  return (
    <>
      <div className="btm-nav btm-nav-lg lg:hidden">
        <Link href="/feed">
          <motion.button
            onClick={(e) => handlePageChange('feed')}
            className={`text-primary ${activePage == 'feed' && 'active'}`}
          >
            <CgHome size={20} />
          </motion.button>
        </Link>
        <motion.button
          onClick={(e) => setActivePage('search')}
          className={`text-primary ${activePage == 'search' && 'active'}`}
        >
          <CgSearch size={20} />
        </motion.button>
        <motion.button
          onClick={(e) => setActivePage('notifications')}
          className={`text-primary ${
            activePage == 'notifications' && 'active'
          }`}
        >
          <CgBell size={20} />
        </motion.button>
        <Link href="/locator">
          <motion.button
            onClick={(e) => handlePageChange('locator')}
            className={`text-primary ${activePage == 'locator' && 'active'}`}
          >
            <CgPin size={20} />
          </motion.button>
        </Link>
        <motion.button
          onClick={(e) => setActivePage('profile')}
          className={`text-primary ${activePage == 'profile' && 'active'}`}
        >
          <div className="avatar online">
            <div className="w-7 h-7 rounded-full">
              <img src="https://avatars.dicebear.com/api/male/geraldchavez.svg" />
            </div>
          </div>
        </motion.button>
      </div>
    </>
  );
};

export default BottomNav;
