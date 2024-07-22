const BASE_URL_HOSPITALS = 'http://localhost:3000/hospitals';
const BASE_URL_SPECIALISTS = 'http://localhost:3000/specialists';
const BASE_URL_CATEGORIES = 'http://localhost:3000/categories';
const BASE_URL_COUNTIES = 'http://localhost:3000/counties';

// Admin login logic
const adminLoginButton = document.getElementById('adminLoginButton');
const modal = document.getElementById('adminLoginModal');
const span = document.getElementsByClassName('close')[0];

adminLoginButton.onclick = function() {
    modal.style.display = 'block';
};

span.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin1' && password === '12341234') {
        modal.style.display = 'none';
        showAdminDashboard();
    } else {
        alert('Invalid username or password!');
    }
};

function showAdminDashboard() {
    document.getElementById('find-options-container').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

// Event listeners for admin buttons
document.getElementById('add-hospital-button').addEventListener('click', () => {
    showForm('add-hospital-form');
});
document.getElementById('add-specialist-button').addEventListener('click', () => {
    showForm('add-specialist-form');
});
document.getElementById('list-hospitals-button').addEventListener('click', fetchAndDisplayHospitals);
document.getElementById('list-specialists-button').addEventListener('click', fetchAndDisplaySpecialists);

function showForm(formId) {
    document.querySelectorAll('form').forEach(form => form.style.display = 'none');
    document.getElementById(formId).style.display = 'block';
}

// Populate county and specialty dropdowns
async function populateDropdowns() {
    try {
        const countyResponse = await fetch(BASE_URL_COUNTIES);
        const counties = await countyResponse.json();
        const countySelect = document.getElementById('hospital-county');
        counties.forEach(county => {
            const option = document.createElement('option');
            option.value = county.name;
            option.text = county.name;
            countySelect.add(option);
        });

        const categoryResponse = await fetch(BASE_URL_CATEGORIES);
        const categories = await categoryResponse.json();
        const specialtySelect = document.getElementById('hospital-specialist-departments');
        const specialistCategorySelect = document.getElementById('specialist-category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.text = category.name;
            specialtySelect.add(option);
            const optionClone = option.cloneNode(true);
            specialistCategorySelect.add(optionClone);
        });
    } catch (error) {
        console.error('Error populating dropdowns:', error);
    }
}

populateDropdowns();

document.getElementById('add-hospital-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('hospital-name').value,
        location: document.getElementById('hospital-location').value,
        county: document.getElementById('hospital-county').value,
        emergencyContact: document.getElementById('hospital-emergency-contact').value,
        helpdeskContact: document.getElementById('hospital-helpdesk-contact').value,
        specialistDepartments: Array.from(document.getElementById('hospital-specialist-departments').selectedOptions).map(option => option.value),
    };
    try {
        const response = await fetch(BASE_URL_HOSPITALS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log('Hospital added:', data);
        fetchAndDisplayHospitals();
    } catch (error) {
        console.error('Error:', error);
    }
});

document.getElementById('add-specialist-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('specialist-name').value,
        contactDetails: {
            phoneNumber: document.getElementById('specialist-phone-number').value,
            email: document.getElementById('specialist-email').value,
        },
        appointmentSchedules: document.getElementById('specialist-schedule').value.split(','),
        licensingLevel: document.getElementById('specialist-licensing-level').value,
        category: document.getElementById('specialist-category').value,
        clinics: document.getElementById('specialist-clinics').value.split(','),
    };
    try {
        const response = await fetch(BASE_URL_SPECIALISTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        console.log('Specialist added:', data);
        fetchAndDisplaySpecialists();
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchAndDisplayHospitals() {
    try {
        const response = await fetch(BASE_URL_HOSPITALS);
        const hospitals = await response.json();
        displayHospitals(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
    }
}

async function fetchAndDisplaySpecialists() {
    try {
        const response = await fetch(BASE_URL_SPECIALISTS);
        const specialists = await response.json();
        displaySpecialists(specialists);
    } catch (error) {
        console.error('Error fetching specialists:', error);
    }
}

function displayHospitals(hospitals) {
    document.getElementById('list-hospitals').style.display = 'block';
    document.getElementById('list-specialists').style.display = 'none';
    const hospitalsList = document.getElementById('hospital-list');
    hospitalsList.innerHTML = '';
    hospitals.forEach(hospital => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${hospital.name}</strong><br>
            Location: ${hospital.location}<br>
            County: ${hospital.county}<br>
            Emergency Contact: ${hospital.emergencyContact}<br>
            Helpdesk Contact: ${hospital.helpdeskContact}<br>
            Specialist Departments: ${hospital.specialistDepartments.join(', ')}
        `;
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            editHospital(hospital);
        });
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteItem(BASE_URL_HOSPITALS, hospital.id, listItem);
        });
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        hospitalsList.appendChild(listItem);
    });
}

function displaySpecialists(specialists) {
    document.getElementById('list-specialists').style.display = 'block';
    document.getElementById('list-hospitals').style.display = 'none';
    const specialistsList = document.getElementById('specialist-list');
    specialistsList.innerHTML = '';
    specialists.forEach(specialist => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${specialist.name}</strong><br>
            Phone Number: ${specialist.contactDetails.phoneNumber}<br>
            Email: ${specialist.contactDetails.email}<br>
            Appointment Schedules: ${specialist.appointmentSchedules.join(', ')}<br>
            Licensing Level: ${specialist.licensingLevel}<br>
            Category: ${specialist.category}<br>
            Clinics: ${specialist.clinics.join(', ')}
        `;
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            editSpecialist(specialist);
        });
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteItem(BASE_URL_SPECIALISTS, specialist.id, listItem);
        });
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        specialistsList.appendChild(listItem);
    });
}

async function deleteItem(baseUrl, id, listItem) {
    try {
        const response = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            listItem.remove();
        } else {
            throw new Error('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

function editHospital(hospital) {
    showForm('add-hospital-form');
    document.getElementById('hospital-name').value = hospital.name;
    document.getElementById('hospital-location').value = hospital.location;
    document.getElementById('hospital-county').value = hospital.county;
    document.getElementById('hospital-emergency-contact').value = hospital.emergencyContact;
    document.getElementById('hospital-helpdesk-contact').value = hospital.helpdeskContact;
    document.getElementById('hospital-specialist-departments').value = hospital.specialistDepartments.join(',');

    document.getElementById('add-hospital-form').onsubmit = async function(event) {
        event.preventDefault();
        const formData = {
            name: document.getElementById('hospital-name').value,
            location: document.getElementById('hospital-location').value,
            county: document.getElementById('hospital-county').value,
            emergencyContact: document.getElementById('hospital-emergency-contact').value,
            helpdeskContact: document.getElementById('hospital-helpdesk-contact').value,
            specialistDepartments: Array.from(document.getElementById('hospital-specialist-departments').selectedOptions).map(option => option.value),
        };
        try {
            const response = await fetch(`${BASE_URL_HOSPITALS}/${hospital.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log('Hospital updated:', data);
            fetchAndDisplayHospitals();
        } catch (error) {
            console.error('Error:', error);
        }
    };
}

function editSpecialist(specialist) {
    showForm('add-specialist-form');
    document.getElementById('specialist-name').value = specialist.name;
    document.getElementById('specialist-phone-number').value = specialist.contactDetails.phoneNumber;
    document.getElementById('specialist-email').value = specialist.contactDetails.email;
    document.getElementById('specialist-schedule').value = specialist.appointmentSchedules.join(',');
    document.getElementById('specialist-licensing-level').value = specialist.licensingLevel;
    document.getElementById('specialist-category').value = specialist.category;
    document.getElementById('specialist-clinics').value = specialist.clinics.join(',');

    document.getElementById('add-specialist-form').onsubmit = async function(event) {
        event.preventDefault();
        const formData = {
            name: document.getElementById('specialist-name').value,
            contactDetails: {
                phoneNumber: document.getElementById('specialist-phone-number').value,
                email: document.getElementById('specialist-email').value,
            },
            appointmentSchedules: document.getElementById('specialist-schedule').value.split(','),
            licensingLevel: document.getElementById('specialist-licensing-level').value,
            category: document.getElementById('specialist-category').value,
            clinics: document.getElementById('specialist-clinics').value.split(','),
        };
        try {
            const response = await fetch(`${BASE_URL_SPECIALISTS}/${specialist.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log('Specialist updated:', data);
            fetchAndDisplaySpecialists();
        } catch (error) {
            console.error('Error:', error);
        }
    };
}

// Event listeners for public view buttons
document.getElementById('hospital-button').addEventListener('click', () => {
    showSection('hospital-section');
    fetchAndDisplayCounties();
});

document.getElementById('specialist-button').addEventListener('click', () => {
    showSection('specialist-section');
    fetchAndDisplayCategories();
});

async function fetchAndDisplayCounties() {
    try {
        const response = await fetch(BASE_URL_COUNTIES);
        const counties = await response.json();
        const locationList = document.getElementById('location-list');
        locationList.innerHTML = '';

        counties.forEach(county => {
            const listItem = document.createElement('li');
            listItem.textContent = county.name;
            listItem.addEventListener('click', () => {
                showHospitals(county.name);
            });
            locationList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching counties:', error);
    }
}

async function fetchAndDisplayCategories() {
    try {
        const response = await fetch(BASE_URL_CATEGORIES);
        const categories = await response.json();
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.textContent = category.name;
            listItem.addEventListener('click', () => {
                showSpecialists(category.name);
            });
            categoryList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function showHospitals(location) {
    try {
        const response = await fetch(`${BASE_URL_HOSPITALS}?location=${location}`);
        const hospitals = await response.json();
        displayHospitalsPublic(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
    }
}

function displayHospitalsPublic(hospitals) {
    const hospitalsList = document.getElementById('hospital-list');
    hospitalsList.innerHTML = '';

    hospitals.forEach(hospital => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${hospital.name}</strong><br>
            Location: ${hospital.location}<br>
            County: ${hospital.county}<br>
            Emergency Contact: ${hospital.emergencyContact}<br>
            Helpdesk Contact: ${hospital.helpdeskContact}<br>
            Specialist Departments: ${hospital.specialistDepartments.join(', ')}
        `;
        hospitalsList.appendChild(listItem);
    });
}

async function showSpecialists(category) {
    const location = document.getElementById('specialist-location').value;
    try {
        const response = await fetch(`${BASE_URL_SPECIALISTS}?category=${category}&location=${location}`);
        const specialists = await response.json();
        displaySpecialistsPublic(specialists);
    } catch (error) {
        console.error('Error fetching specialists:', error);
    }
}

function displaySpecialistsPublic(specialists) {
    const specialistsList = document.getElementById('specialist-list');
    specialistsList.innerHTML = '';

    specialists.forEach(specialist => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${specialist.name}</strong><br>
            Phone Number: ${specialist.contactDetails.phoneNumber}<br>
            Email: ${specialist.contactDetails.email}<br>
            Appointment Schedules: ${specialist.appointmentSchedules.join(', ')}<br>
            Licensing Level: ${specialist.licensingLevel}<br>
            Category: ${specialist.category}<br>
            Clinics: ${specialist.clinics.join(', ')}
        `;
        specialistsList.appendChild(listItem);
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

document.getElementById('hospital-button').addEventListener('click', () => {
    showSection('hospital-section');
    fetchAndDisplayCounties();
});

document.getElementById('specialist-button').addEventListener('click', () => {
    showSection('specialist-section');
    fetchAndDisplayCategories();
});

async function fetchAndDisplayCounties() {
    try {
        const response = await fetch(BASE_URL_COUNTIES);
        const counties = await response.json();
        const locationList = document.getElementById('location-list');
        locationList.innerHTML = '';

        counties.forEach(county => {
            const listItem = document.createElement('li');
            listItem.textContent = county.name;
            listItem.addEventListener('click', () => {
                showHospitals(county.name);
            });
            locationList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching counties:', error);
    }
}

async function fetchAndDisplayCategories() {
    try {
        const response = await fetch(BASE_URL_CATEGORIES);
        const categories = await response.json();
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.textContent = category.name;
            listItem.addEventListener('click', () => {
                showSpecialists(category.name);
            });
            categoryList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function showHospitals(location) {
    try {
        const response = await fetch(`${BASE_URL_HOSPITALS}?location=${location}`);
        const hospitals = await response.json();
        displayHospitalsPublic(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
    }
}

