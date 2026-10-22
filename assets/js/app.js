
var cl = console.log;

const form = document.getElementById("form");
const FoodName = document.getElementById("FoodName");
const Category = document.getElementById("Category");
const Price = document.getElementById("Price");
const foodData = document.getElementById("foodData");
const SubmitBtn = document.getElementById("SubmitBtn");
const UpdateBtn = document.getElementById("UpdateBtn");
const spinner = document.getElementById("spinner");

const Base_url = "https://xhr-1st-crud-default-rtdb.firebaseio.com";
const Food_url = `${Base_url}/Food.json`;

const state = {
    FoodArr: [],
    Edit_Id: null
};

function Handlespinner() {
    spinner.classList.toggle("d-none");
}

function Snakbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000,
        showConfirmButton: false
    });
}

// Show Data
function SowData(arr) {
    let result = "";

    arr.forEach((ele, i) => {
        result += `
        <tr id="${ele.id}">
            <td>${i + 1}</td>
            <td>${ele.name}</td>
            <td>${ele.category}</td>
            <td>₹${ele.price}</td>
            <td>
                <i onclick="OnEdit(this)"
                class="fa-solid fa-pen text-primary"></i>
            </td>
            <td>
                <i onclick="Onremove(this)"
                class="fa-solid fa-trash text-danger"></i>
            </td>
        </tr>`;
    });

    foodData.innerHTML = result;
}

// Read
function OnShowAll() {
    Handlespinner();

    fetch(Food_url)
        .then(res => res.json())
        .then(data => {
            state.FoodArr = [];

            if (data) {
                for (const key in data) {
                    data[key].id = key;
                    state.FoodArr.unshift(data[key]);
                }
            }

            SowData(state.FoodArr);
        })
        .catch(err => {
            cl(err);
            Snakbar("Something went wrong", "error");
        })
        .finally(() => Handlespinner());
}

OnShowAll();

// Create
function OnCreate(eve) {
    eve.preventDefault();

    const newObj = {
        name: FoodName.value,
        category: Category.value,
        price: Price.value
    };

    Handlespinner();

    fetch(Food_url, {
        method: "POST",
        body: JSON.stringify(newObj),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            newObj.id = data.name;
            state.FoodArr.unshift(newObj);
            SowData(state.FoodArr);

            form.reset();
            Snakbar("Food Added Successfully", "success");
        })
        .catch(err => {
            cl(err);
            Snakbar("Food not added", "error");
        })
        .finally(() => Handlespinner());
}

// Edit
function OnEdit(eve) {
    const id = eve.closest("tr").id;
    state.Edit_Id = id;

    const obj = state.FoodArr.find(ele => ele.id === id);

    FoodName.value = obj.name;
    Category.value = obj.category;
    Price.value = obj.price;

    SubmitBtn.classList.add("d-none");
    UpdateBtn.classList.remove("d-none");
}

// Update
function OnUpdate() {
    if (!form.reportValidity()) return;

    const id = state.Edit_Id;

    const updateObj = {
        name: FoodName.value,
        category: Category.value,
        price: Price.value
    };

    Handlespinner();

    fetch(`${Base_url}/Food/${id}.json`, {
        method: "PATCH",
        body: JSON.stringify(updateObj),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            const index = state.FoodArr.findIndex(ele => ele.id === id);

            state.FoodArr[index] = { ...data, id: id };
            SowData(state.FoodArr);

            form.reset();
            state.Edit_Id = null;

            SubmitBtn.classList.remove("d-none");
            UpdateBtn.classList.add("d-none");

            Snakbar("Food Updated Successfully", "success");
        })
        .catch(err => {
            cl(err);
            Snakbar("Update Failed", "error");
        })
        .finally(() => Handlespinner());
}

// Delete
function Onremove(eve) {
    const id = eve.closest("tr").id;

    Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    }).then(result => {
        if (result.isConfirmed) {
            Handlespinner();

            fetch(`${Base_url}/Food/${id}.json`, {
                method: "DELETE"
            })
                .then(res => res.json())
                .then(() => {
                    state.FoodArr = state.FoodArr.filter(
                        ele => ele.id !== id
                    );

                    SowData(state.FoodArr);
                    Snakbar("Food Deleted Successfully", "success");
                })
                .catch(err => {
                    cl(err);
                    Snakbar("Delete Failed", "error");
                })
                .finally(() => Handlespinner());
        }
    });
}

form.addEventListener("submit", OnCreate);
UpdateBtn.addEventListener("click", OnUpdate);
