import Navbar from "./components/navbar/page";
import Footer from "./components/footer/page";
import Home from "./pages/home/page";
import { Toaster } from "react-hot-toast";

export default function Main() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <Home />
    </div>
  );
}
