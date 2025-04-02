import { BrowserRouter, Route, Routes} from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Login from "./pages/Login";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import Recordings from "./pages/Recordings";

export default function App() {
  return (
    <>
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Login />}/>

        <Route path="/home" element={
          <PrivateRoute>
          < Home />
        </PrivateRoute>
        }/>

        <Route path="/recordings" element={
          <PrivateRoute>
          < Recordings />
        </PrivateRoute>
        }/>
      </Routes>
    </BrowserRouter>
    </>
  )
}