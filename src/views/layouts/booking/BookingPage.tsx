// styles
import "./bookingPage.scss";

// hooks | library
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import WithAuth from "../../../utils/middleware/WithAuth";

// components
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";
import BackToTop from "../../components/backToTop/BackToTop";
import Button from "../../components/button/Button";
import BookingCalendar from "../../components/bookingCalendar/BookingCalendar";

function BookingPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <div id="bookingPage">
      <Header />
      <SubNav />
      <main>
        <div className="bookingHeader">
          <Button style="back" onClick={() => navigate("/home")}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
          <h1>Booking salle de production</h1>
        </div>
        <div className="calendarWrapper">
          <BookingCalendar />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const BookingPageWithAuth = WithAuth(BookingPage);
export default BookingPageWithAuth;
