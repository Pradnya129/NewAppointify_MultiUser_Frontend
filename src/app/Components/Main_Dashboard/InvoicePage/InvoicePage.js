import { useRouter } from 'next/router';
import { useEffect } from 'react';

const InvoicePage = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    // Fetch base64 PDF from backend
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`https://appointify.coinagesoft.com/api/CustomerAppointment/GetInvoice?id=${id}`);
        const data = await res.json();

        if (data && data.receipt) {
          const byteCharacters = atob(data.receipt);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);

          window.location.href = blobUrl;
        } else {
          alert('Invoice not found or failed to load.');
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        alert("Failed to fetch invoice.");
      }
    };

    fetchInvoice();
  }, [id]);

  return <div>Loading invoice...</div>;
};

export default InvoicePage;
