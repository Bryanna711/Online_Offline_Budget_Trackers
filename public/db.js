const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = ({ target }) => {
    db = target.result;
    db.createObjectStore("budgetStore", { autoIncrement: true });
};
request.onsuccess = ({ target }) => {
    console.log("Successful");
    db = target.result;

    if (navigator.onLine) {
        console.log("Backend is Online");
        checkDatabase();
    }
};

request.onerror = (event) => {
    console.log(`error : ${event.target.errorCode}`)
};

const checkDatabase = () => {
    const transaction = db.transaction(["budgetStore"], "readwrite");

    const store = transaction.objectStore("budgetStore");

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.length !== 0) {
                        const transaction = db.transaction(["budgetStore"], "readwrite");
                        const store = transaction.objectStore("budgetStore");
                        store.clear();
                        console.log("Cleared Store");
                    }
                });
        }
    };
};

const saveRecord = (record) => {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
    store.add(record);
};

window.addEventListener("online", checkDatabase)