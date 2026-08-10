// ==========================================
// LOAD DATA FROM LOCAL STORAGE
// ==========================================

let customers = [];

try {
    customers =
        JSON.parse(
            localStorage.getItem("hisaabCustomers")
        ) || [];
} catch (error) {
    customers = [];
}


// ==========================================
// MIGRATE / FIX OLD DATA
// ==========================================

customers = customers.map(customer => {

    return {
        id: customer.id || Date.now().toString(),

        name: customer.name || "Unknown Customer",

        // Old data me hourlyRate nahi tha
        hourlyRate:
            Number(customer.hourlyRate) || 0,

        works:
            Array.isArray(customer.works)
                ? customer.works.map(work => {

                    return {
                        id:
                            work.id ||
                            Date.now().toString(),

                        name:
                            work.name ||
                            "Untitled Work",

                        time:
                            Number(work.time) || 0,

                        money:
                            Number(work.money) || 0,

                        date:
                            work.date ||
                            new Date()
                                .toLocaleDateString("en-IN")
                    };

                })
                : []
    };

});


// Save migrated data
saveData();


// ==========================================
// SELECTED CUSTOMER
// ==========================================

let selectedCustomerId = null;


// ==========================================
// ELEMENTS
// ==========================================

// Dashboard

const customerList =
    document.getElementById("customerList");

const emptyMessage =
    document.getElementById("emptyMessage");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalTime =
    document.getElementById("totalTime");

const totalMoney =
    document.getElementById("totalMoney");


// Customer Modal

const customerModal =
    document.getElementById("customerModal");

const customerForm =
    document.getElementById("customerForm");

const customerName =
    document.getElementById("customerName");

const hourlyRate =
    document.getElementById("hourlyRate");


// Work Modal

const workModal =
    document.getElementById("workModal");

const workForm =
    document.getElementById("workForm");

const workCustomerName =
    document.getElementById("workCustomerName");

const workName =
    document.getElementById("workName");

const workHours =
    document.getElementById("workHours");

const workMinutes =
    document.getElementById("workMinutes");

const previewRate =
    document.getElementById("previewRate");

const previewTime =
    document.getElementById("previewTime");

const previewAmount =
    document.getElementById("previewAmount");


// Details Modal

const detailsModal =
    document.getElementById("detailsModal");

const detailsCustomerName =
    document.getElementById("detailsCustomerName");

const detailsRate =
    document.getElementById("detailsRate");

const detailsTotalTime =
    document.getElementById("detailsTotalTime");

const detailsTotalMoney =
    document.getElementById("detailsTotalMoney");

const workList =
    document.getElementById("workList");


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {

    localStorage.setItem(
        "hisaabCustomers",
        JSON.stringify(customers)
    );

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return Number(amount || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(minutes) {

    minutes =
        Number(minutes) || 0;


    const hours =
        Math.floor(minutes / 60);


    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;

}


// ==========================================
// GET CUSTOMER TOTALS
// ==========================================

function getCustomerTotals(customer) {

    let time = 0;

    let money = 0;


    customer.works.forEach(work => {

        time += Number(work.time) || 0;

        money += Number(work.money) || 0;

    });


    return {
        time,
        money
    };

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    let allTime = 0;

    let allMoney = 0;


    customers.forEach(customer => {

        const totals =
            getCustomerTotals(customer);


        allTime += totals.time;

        allMoney += totals.money;

    });


    totalCustomers.textContent =
        customers.length;


    totalTime.textContent =
        formatTime(allTime);


    totalMoney.textContent =
        formatMoney(allMoney);

}


// ==========================================
// RENDER CUSTOMERS
// ==========================================

function renderCustomers() {

    customerList.innerHTML = "";


    if (customers.length === 0) {

        emptyMessage.style.display =
            "block";

    } else {

        emptyMessage.style.display =
            "none";

    }


    customers.forEach(customer => {

        const totals =
            getCustomerTotals(customer);


        const card =
            document.createElement("div");


        card.className =
            "customer-card";


        card.innerHTML = `

            <div class="customer-top">

                <div class="customer-info">

                    <h3>
                        ${escapeHTML(customer.name)}
                    </h3>

                    <p>
                        ${customer.works.length}
                        work${customer.works.length !== 1 ? "s" : ""}
                    </p>

                </div>


                <button
                    class="delete-customer"
                    onclick="deleteCustomer('${customer.id}')">

                    🗑

                </button>

            </div>


            <div class="customer-rate">

                ₹${formatMoney(customer.hourlyRate)}
                / hour

            </div>


            <div class="customer-stats">

                <div class="customer-stat">

                    <span>
                        Total Time
                    </span>

                    <strong>
                        ${formatTime(totals.time)}
                    </strong>

                </div>


                <div class="customer-stat">

                    <span>
                        Total Money
                    </span>

                    <strong>
                        ₹${formatMoney(totals.money)}
                    </strong>

                </div>

            </div>


            <div class="card-actions">

                <button
                    class="add-work-btn"
                    onclick="openWorkModal('${customer.id}')">

                    + Add Work

                </button>


                <button
                    class="details-btn"
                    onclick="openDetails('${customer.id}')">

                    View Details

                </button>

            </div>

        `;


        customerList.appendChild(card);

    });


    updateDashboard();

}


// ==========================================
// ADD CUSTOMER
// ==========================================

customerForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            customerName.value.trim();


        const rate =
            Number(hourlyRate.value);


        // Validation

        if (!name) {

            alert("Enter customer name");

            customerName.focus();

            return;

        }


        if (!Number.isFinite(rate) || rate <= 0) {

            alert(
                "Enter a valid hourly rate"
            );

            hourlyRate.focus();

            return;

        }


        // Create customer

        const customer = {

            id:
                generateId(),

            name:
                name,

            hourlyRate:
                rate,

            works:
                []

        };


        customers.push(customer);


        // Save

        saveData();


        // Update UI

        renderCustomers();


        // Reset form

        customerForm.reset();


        // Close modal

        closeModal(customerModal);

    }
);


// ==========================================
// DELETE CUSTOMER
// ==========================================

function deleteCustomer(id) {

    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${customer.name}" and all its work?`
        );


    if (!confirmed) {
        return;
    }


    customers =
        customers.filter(
            customer =>
                customer.id !== id
        );


    saveData();


    renderCustomers();


    // If details modal was open

    if (
        selectedCustomerId === id
    ) {

        closeModal(detailsModal);

        selectedCustomerId = null;

    }

}


// ==========================================
// OPEN WORK MODAL
// ==========================================

function openWorkModal(id) {

    selectedCustomerId = id;


    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) {
        return;
    }


    workCustomerName.textContent =
        `${customer.name} • ₹${formatMoney(customer.hourlyRate)}/hour`;


    workForm.reset();


    workHours.value = 0;

    workMinutes.value = 0;


    updatePreview();


    openModal(workModal);

}


// ==========================================
// LIVE WORK CALCULATION
// ==========================================

function updatePreview() {

    const customer =
        customers.find(
            customer =>
                customer.id === selectedCustomerId
        );


    if (!customer) {
        return;
    }


    let hours =
        Number(workHours.value) || 0;


    let minutes =
        Number(workMinutes.value) || 0;


    // Prevent negative values

    if (hours < 0) {
        hours = 0;
    }


    if (minutes < 0) {
        minutes = 0;
    }


    // Keep minutes below 60

    if (minutes > 59) {
        minutes = 59;
    }


    const totalMinutes =
        (hours * 60) + minutes;


    const totalHours =
        totalMinutes / 60;


    // Automatic money calculation

    const amount =
        totalHours *
        Number(customer.hourlyRate);


    previewRate.textContent =
        formatMoney(
            customer.hourlyRate
        );


    previewTime.textContent =
        formatTime(totalMinutes);


    previewAmount.textContent =
        formatMoney(amount);

}


// ==========================================
// TIME INPUT EVENTS
// ==========================================

workHours.addEventListener(
    "input",
    updatePreview
);


workMinutes.addEventListener(
    "input",
    updatePreview
);


// ==========================================
// ADD WORK
// ==========================================

workForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const customer =
            customers.find(
                customer =>
                    customer.id ===
                    selectedCustomerId
            );


        if (!customer) {

            alert("Customer not found");

            return;

        }


        const name =
            workName.value.trim();


        const hours =
            Number(workHours.value) || 0;


        const minutes =
            Number(workMinutes.value) || 0;


        // Validation

        if (!name) {

            alert("Enter work name");

            workName.focus();

            return;

        }


        if (hours < 0 || minutes < 0) {

            alert(
                "Time cannot be negative"
            );

            return;

        }


        if (minutes > 59) {

            alert(
                "Minutes must be between 0 and 59"
            );

            return;

        }


        if (
            hours === 0 &&
            minutes === 0
        ) {

            alert(
                "Enter the time taken"
            );

            return;

        }


        // Calculate time

        const totalMinutes =
            (hours * 60) + minutes;


        // Convert minutes to hours

        const totalHours =
            totalMinutes / 60;


        // Calculate money

        const money =
            totalHours *
            Number(customer.hourlyRate);


        // Create work

        const work = {

            id:
                generateId(),

            name:
                name,

            time:
                totalMinutes,

            money:
                money,

            date:
                new Date()
                    .toLocaleDateString("en-IN")

        };


        // Add work

        customer.works.push(work);


        // Save

        saveData();


        // Update customer cards

        renderCustomers();


        // Close

        closeModal(workModal);

    }
);


// ==========================================
// OPEN DETAILS
// ==========================================

function openDetails(id) {

    selectedCustomerId = id;


    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) {
        return;
    }


    detailsCustomerName.textContent =
        customer.name;


    detailsRate.textContent =
        formatMoney(
            customer.hourlyRate
        );


    renderWorkDetails(customer);


    openModal(detailsModal);

}


// ==========================================
// RENDER WORK DETAILS
// ==========================================

function renderWorkDetails(customer) {

    workList.innerHTML = "";


    const totals =
        getCustomerTotals(customer);


    detailsTotalTime.textContent =
        formatTime(totals.time);


    detailsTotalMoney.textContent =
        formatMoney(totals.money);


    // No work

    if (customer.works.length === 0) {

        workList.innerHTML = `

            <p
                style="
                    text-align:center;
                    color:#7b8495;
                    padding:20px;
                "
            >

                No work added yet.

            </p>

        `;

        return;

    }


    // Work list

    customer.works.forEach(work => {

        const item =
            document.createElement("div");


        item.className =
            "work-item";


        item.innerHTML = `

            <div>

                <h4>
                    ${escapeHTML(work.name)}
                </h4>

                <p>

                    ${work.date}

                    •

                    ${formatTime(work.time)}

                </p>

            </div>


            <div class="work-right">

                <span class="work-money">

                    ₹${formatMoney(work.money)}

                </span>


                <button
                    class="delete-work"
                    onclick="
                        deleteWork(
                            '${customer.id}',
                            '${work.id}'
                        )
                    "
                >

                    ×

                </button>

            </div>

        `;


        workList.appendChild(item);

    });

}


// ==========================================
// DELETE WORK
// ==========================================

function deleteWork(
    customerId,
    workId
) {

    const customer =
        customers.find(
            customer =>
                customer.id === customerId
        );


    if (!customer) {
        return;
    }


    const confirmed =
        confirm(
            "Delete this work?"
        );


    if (!confirmed) {
        return;
    }


    customer.works =
        customer.works.filter(
            work =>
                work.id !== workId
        );


    saveData();


    renderCustomers();


    // Refresh details

    renderWorkDetails(customer);

}


// ==========================================
// MODAL OPEN
// ==========================================

function openModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.add("active");

}


// ==========================================
// MODAL CLOSE
// ==========================================

function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove("active");

}


// ==========================================
// ADD CUSTOMER BUTTON
// ==========================================

const addCustomerBtn =
    document.getElementById(
        "addCustomerBtn"
    );


if (addCustomerBtn) {

    addCustomerBtn.addEventListener(
        "click",
        function () {

            openModal(customerModal);

            customerName.focus();

        }
    );

}


// ==========================================
// EMPTY ADD BUTTON
// ==========================================

const emptyAddBtn =
    document.getElementById(
        "emptyAddBtn"
    );


if (emptyAddBtn) {

    emptyAddBtn.addEventListener(
        "click",
        function () {

            openModal(customerModal);

            customerName.focus();

        }
    );

}


// ==========================================
// CLOSE CUSTOMER MODAL
// ==========================================

const closeCustomerModal =
    document.getElementById(
        "closeCustomerModal"
    );


if (closeCustomerModal) {

    closeCustomerModal.addEventListener(
        "click",
        function () {

            closeModal(customerModal);

        }
    );

}


// ==========================================
// CLOSE WORK MODAL
// ==========================================

const closeWorkModal =
    document.getElementById(
        "closeWorkModal"
    );


if (closeWorkModal) {

    closeWorkModal.addEventListener(
        "click",
        function () {

            closeModal(workModal);

        }
    );

}


// ==========================================
// CLOSE DETAILS MODAL
// ==========================================

const closeDetailsModal =
    document.getElementById(
        "closeDetailsModal"
    );


if (closeDetailsModal) {

    closeDetailsModal.addEventListener(
        "click",
        function () {

            closeModal(detailsModal);

        }
    );

}


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            customerModal
        ) {

            closeModal(customerModal);

        }


        if (
            event.target ===
            workModal
        ) {

            closeModal(workModal);

        }


        if (
            event.target ===
            detailsModal
        ) {

            closeModal(detailsModal);

        }

    }
);


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeModal(customerModal);

            closeModal(workModal);

            closeModal(detailsModal);

        }

    }
);


// ==========================================
// GENERATE UNIQUE ID
// ==========================================

function generateId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


// ==========================================
// BASIC HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIAL RENDER
// ==========================================

renderCustomers();
