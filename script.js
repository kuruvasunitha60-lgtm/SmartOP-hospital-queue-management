
document.addEventListener("DOMContentLoaded", function () {

    const nameInput = document.getElementById("patientName");
    const department = document.getElementById("department");
    const registerBtn = document.getElementById("registerBtn");

    const currentDepartment = document.getElementById("currentDepartment");
    const nextBtn = document.getElementById("nextBtn");

    const waitingDepartment = document.getElementById("waitingDepartment");
    const waitingList = document.getElementById("waitingList");

    const currentPatient = document.getElementById("currentPatient");
    const message = document.getElementById("message");


    // Patient Registration
    registerBtn.addEventListener("click", async function () {

        const name = nameInput.value.trim();
        const dept = department.value;

        if (!name || !dept) {
            message.textContent = "Please enter name and select department!";
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    department: dept
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.error;
                return;
            }

            message.textContent =
                "Patient Registered! Your Token Number: " +
                data.patient.token;

            nameInput.value = "";

            await loadWaitingList();
        } catch (error) {
            message.textContent = "Server connection error!";
        }
    });


    // Display Waiting List
    async function loadWaitingList() {

        const dept = waitingDepartment.value;

        try {
            const response = await fetch(
                "/waiting/" + encodeURIComponent(dept)
            );

            const patients = await response.json();

            waitingList.innerHTML = "";

            patients.forEach(function (patient) {

                const row = document.createElement("tr");

                [
                    patient.token,
                    patient.name,
                    patient.department,
                    patient.status,
                    patient.time
                ].forEach(function (value) {

                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);

                });

                waitingList.appendChild(row);
            });

        } catch (error) {
            waitingList.innerHTML =
                "<tr><td colspan='5'>Unable to load patients</td></tr>";
        }
    }


    // Call Next Patient
    nextBtn.addEventListener("click", async function () {

        const dept = currentDepartment.value;

        try {
            const response = await fetch(
                "/next/" + encodeURIComponent(dept),
                { method: "POST" }
            );

            const data = await response.json();

            if (!response.ok) {
                currentPatient.textContent = data.error;
                return;
            }

            currentPatient.textContent =
                "Now Serving: Token " + data.token +
                " - " + data.name;

            await loadWaitingList();

        } catch (error) {
            currentPatient.textContent = "Server connection error!";
        }
    });


    // Department Changes
    waitingDepartment.addEventListener("change", loadWaitingList);

    currentDepartment.addEventListener("change", async function () {

        const dept = currentDepartment.value;

        try {
            const response = await fetch(
                "/current/" + encodeURIComponent(dept)
            );

            const patient = await response.json();

            if (patient.token) {
                currentPatient.textContent =
                    "Now Serving: Token " + patient.token +
                    " - " + patient.name;
            } else {
                currentPatient.textContent =
                    "No patients currently serving.";
            }

        } catch (error) {
            currentPatient.textContent = "Unable to load patient.";
        }
    });


    loadWaitingList();

});
