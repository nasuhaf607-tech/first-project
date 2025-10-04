import React, { useEffect, useState } from "react";

const DriverClone = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost/first-project/backend/getBook.php?email=test@mail.com");
        const result = await response.json();
        console.log("Server data:", result);
        setBookings(result);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchBookings(); // call async fn
  }, []);

  return (
    <div>
      <h2>Driver Bookings</h2>
      {bookings.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Time</th>
              <th>Special Needs</th>
              <th>Recurring</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((row, i) => (
              <tr key={i}>
                <td>{row.pickup}</td>
                <td>{row.destination}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>{row.specialNeeds}</td>
                <td>{row.recurring}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default DriverClone;
