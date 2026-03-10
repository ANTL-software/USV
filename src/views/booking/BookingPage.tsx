// styles
import "./bookingPage.scss";

// hooks | library
import { ReactElement } from "react";
import WithAuth from "../../utils/middleware/WithAuth";

// components
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";
import BookingCalendar from "../../components/bookingCalendar/BookingCalendar";

function BookingPage(): ReactElement {
  return (
    <div id="bookingPage">
      <Header />
      <SubNav />
      <main>
        <div className="bookingHeader">
          <h1>Booking salle de production</h1>
        </div>
        <div className="calendarWrapper">
          <BookingCalendar />
        </div>
      </main>
    </div>
  );
}

const BookingPageWithAuth = WithAuth(BookingPage);
export default BookingPageWithAuth;
