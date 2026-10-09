const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", function () {

    // =============================================================
    // 1. DASHBOARD LOGIC (index.html)
    // =============================================================
    const customerList = document.getElementById("customer-list");
    const searchInput = document.getElementById("search-input");

    if (customerList) {
        fetchCustomers();

        if (searchInput) {
            searchInput.addEventListener("input", function (e) {
                const query = e.target.value.toLowerCase();
                filterCustomers(query);
            });
        }
    }

    function fetchCustomers() {
        fetch(`${API_BASE_URL}/customers/`)
            .then(res => res.json())
            .then(data => {
                window.allCustomers = data;
                renderCustomerList(data);
            })
            .catch(err => console.error("Error fetching customers:", err));
    }

    function renderCustomerList(customers) {
        if (!customerList) return;
        customerList.innerHTML = "";

        if (customers.length === 0) {
            customerList.innerHTML = "<p style='text-align:center; padding: 20px;'>No customers found.</p>";
            return;
        }

        customers.forEach(customer => {
            const card = document.createElement("div");
            card.className = "customer-card";
            card.style.cursor = "pointer";
            
            card.onclick = () => {
                window.location.href = `customer-details.html?id=${customer.id}`;
            };

            const latestOrder = customer.orders && customer.orders.length > 0 ? customer.orders[0] : null;
            const status = latestOrder ? latestOrder.status : "Pending";
            const cloth = latestOrder ? (latestOrder.cloth_type || latestOrder.clothing || latestOrder.clothes_types || "N/A") : "N/A";

            card.innerHTML = `
                <div class="customer-info">
                    <h3>${customer.name}</h3>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Item:</strong> ${cloth}</p>
                </div>
                <div class="customer-status">
                    <span class="status-badge ${status.toLowerCase()}">${status}</span>
                </div>
            `;
            customerList.appendChild(card);
        });
    }

    function filterCustomers(query) {
        if (!window.allCustomers) return;
        const filtered = window.allCustomers.filter(cust => {
            const nameMatch = cust.name.toLowerCase().includes(query);
            const phoneMatch = cust.phone.includes(query);
            return nameMatch || phoneMatch;
        });
        renderCustomerList(filtered);
    }


    // =============================================================
    // 2. ADD CUSTOMER LOGIC (add-customer.html)
    // =============================================================
    const saveBtn = document.getElementById("save-btn");

    if (saveBtn) {
        saveBtn.addEventListener("click", function () {
            const name = document.getElementById("cust-name")?.value.trim();
            const phone = document.getElementById("cust-phone")?.value.trim();

            if (!name || !phone) {
                alert("Please fill in Customer Name and Mobile Number.");
                return;
            }

            const customerData = {
                name: name,
                phone: phone,
                address: document.getElementById("cust-address")?.value || "",
                cloth_type: document.getElementById("cloth-type")?.value || "",
                delivery_date: document.getElementById("delivery-date")?.value || null,
                total_amount: document.getElementById("total-amount")?.value || 0,
                advance_amount: document.getElementById("advance-amount")?.value || 0,
                status: "Pending"
            };

            fetch(`${API_BASE_URL}/add-customer/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customerData)
            })
            .then(res => {
                if (res.ok || res.status === 201) {
                    return res.json();
                }
                throw new Error("API request failed");
            })
            .then(data => {
                alert("Customer Successfully Added!");
                // Force redirect after clicking alert
                window.location.href = "index.html";
            })
            .catch(err => {
                console.error("Error adding customer:", err);
                alert("Server issue while adding customer.");
            });
        });
    }

});