import { useState, useContext, useEffect } from 'react';
import { Button, Col, Container, Row, Navbar,} from 'react-bootstrap';
import { listAllPages, listAllPubPages, getUsers, getTitle, updateTitle, checkLogin, doLogout } from './API.js';
import {Page, Block, User} from './model.js' ; 
import {UserContext} from './UserContext.js' ; 
import { PageList} from './PageList';
import {BlockList} from './BlockList.jsx';
import {LoginForm} from './LoginForm.jsx';
import {NewOrEditPages} from './NewOrEditPages.jsx';
import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from 'react-router-dom' ; 

import 'bootstrap/dist/css/bootstrap.min.css';


function App() {

  const [pages, setPages] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser):{};
  });
  const [realUsers, setRealUsers] = useState([])

  useEffect(() => {
    getUsers().then((res) => {
      setRealUsers(res);
    })
  },[]);


  const validateLogin = async (username, password) => {
    const user = await checkLogin(username, password);
    const castedUser = new User(user.userId, user.type, user.username, user.name, user.surname); 
    setUser(castedUser);
    localStorage.setItem('user', JSON.stringify(castedUser));
  }

  
  const handleLogout = async () => {
    await doLogout();
    setUser({});
    localStorage.removeItem('user');}
  
  
  useEffect(() => {
    if(!user.userId) {
      listAllPubPages().then((pages) => {
        setPages(pages)
      })
    } else {
      listAllPages().then((pages)=> {
        setPages(pages)
      })
    }
  }, [user]);

  
  return (
    <UserContext.Provider value={user}>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            <Route element={<Layout handleLogout={handleLogout} />} >
              <Route index element={<PageList pages={pages} />} />
              <Route path="/login" element={<LoginForm validateLogin={validateLogin} />} />
              <Route path="/blocks/:pageId" element={<BlockList pages={pages} setPages={setPages} />} />
              <Route path="/editPage/:pageId" element={<NewOrEditPages pages={pages} mode="edit" realUsers={realUsers} setPages={setPages} />} />
              <Route path="/addPage" element={<NewOrEditPages mode="add" realUsers={realUsers} setPages={setPages} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
  
  
}

function Layout(props) {
  
  const user = useContext(UserContext) ; 
  const [editingBrand, setEditingBrand] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [oldBrandName, setOldBrandName] = useState("")
  
  useEffect(() => {
    getTitle().then((res)=> {
      setBrandName(res); 
      setOldBrandName(res)
    })
  }, []);

  const handleBrandEdit = () => {
    setEditingBrand(true);
  };

  const handleBrandSave = () => {
    if(brandName.trim() !== ''){
       updateTitle(brandName);
    setOldBrandName(brandName);
    setEditingBrand(false);
    }
  };

  const handleBrandCancel = () => {
    setBrandName(oldBrandName);
    setEditingBrand(false);
  };

  return (
    <>
      <header>
        <Navbar sticky="top" variant="dark" bg="primary" expand="lg" className="mb-3 navbar-custom">
          <Container>
            {editingBrand ? (
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="form-control mr-2"
              />
            ) : (
            <Navbar.Brand>
              <Link to="/" className="navbar-brand-link custom-brand-color">
                <span style={{ textDecoration: 'none' , padding: '5px 10px', color: '#333', fontWeight: 'bold' }}>
                  {brandName}
                </span>
              </Link>
            </Navbar.Brand>

            )}
            {user.type === "admin" && (
              <>
                {editingBrand ? (
                  <>
                    <Button variant="success" onClick={handleBrandSave} className="mr-2">
                      Save
                    </Button>
                    <Button variant="secondary" onClick={handleBrandCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline-light" onClick={handleBrandEdit}>
                    Edit Brand
                  </Button>
                )}
              </>
            )}
  
            <Navbar.Text>
              {user.userId ? (
                <span>
                  {user.username} <Link to="/" onClick={props.handleLogout} className="navbar-link">Logout</Link>
                </span>
              ) : (
                <Link to="/login" className="navbar-link">Login</Link>
              )}
            </Navbar.Text>
          </Container>
        </Navbar>
      </header>
      <main>
        <Container>
          <Outlet />
        </Container>
      </main>
      <footer className="footer">
        <Container>
          <div className="footer-content">
            <span className="greeting">WA1-2023</span>
          </div>
        </Container>
      </footer>
    </>
  );
  
  
}


export default App
