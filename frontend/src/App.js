import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// components
import { Footer } from './components/Footer';

// pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthLayout } from './pages/AuthLayout';
import { Index } from './pages/Index';
import { Notifications } from './pages/Notifications';
import { Requests } from './pages/Requests';
import { User } from './pages/User';
import { EditProfile } from './pages/EditProfile';
import {Units} from "./pages/Units";
import {MyUnits} from "./pages/MyUnits";
import {CreateUnit} from "./pages/CreateUnit";
import {EditUnit} from "./pages/EditUnit";

function App() {
  return (
    <>
    <div id="content-wrap">
      <Routes>
        <Route path="" element={<Navigate to="/login/" />} />
        <Route exact path="/login/" element={<Login />} />
        <Route exact path="/register/" element={<Register />} />
        <Route path="/" element={<AuthLayout />}>
          {/* pages with header + authentication needed */}
          <Route path="index/" element={<Index />} />
          <Route path="notifications/" element={<Notifications />} />
          <Route path="properties/" element={<MyUnits />} />
          <Route path="properties/createunit/" element={<CreateUnit />} />
          <Route path="properties/:id/edit/" element={<EditUnit />} />
          <Route path="properties/:id/" element={<Units />} />
          <Route path="requests/" element={<Requests />} />
          <Route path="accounts/:id/" element={<User />} />
          <Route path="accounts/edit/" element={<EditProfile />} />
        </Route>
      </Routes>     
    </div>
    <Footer />
    </>
  );
}

export default App;
