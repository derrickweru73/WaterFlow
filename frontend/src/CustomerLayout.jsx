import CustomerFooter from "./components/CustomerFooter";

function CustomerLayout({ children }) {
  return (
    <div className="customer-page-layout">
      <main className="customer-page-content">
        {children}
      </main>

      <CustomerFooter />
    </div>
  );
}

export default CustomerLayout;
 
