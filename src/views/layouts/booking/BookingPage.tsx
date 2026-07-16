// styles
import "./bookingPage.scss";

// hooks | library
import type { ReactElement } from "react";
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useBookingPage } from '../../../hooks/index.ts';
import { BookingPageContent } from "../../components/index.ts";

function BookingPage(): ReactElement {
  return <BookingPageContent viewModel={useBookingPage()} />;
}

const BookingPageWithAuth = WithAuth(BookingPage);
export default BookingPageWithAuth;
