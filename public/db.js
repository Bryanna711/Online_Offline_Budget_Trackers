let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("budgetStore", { autoIncrement: true })
};

request.onerror = (event) => {
    console.log(`error : ${event.target.errorCode}`)
};

const checkDatabase = () => {
    let transaction = db.transaction(["budgetStore"], "readwrite");

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
                .then((response) => response.json())
                .then((res) => {
                    if (res.length !== 0) {
                        transaction = db.transaction([""], "readwrite");

                        const currentStore = transaction.objectStore("");
                        currentStore.clear();
                        console.log("Cleared Store");
                    }
                });
        }
    };
}
request.onsuccess = (event) => {
    console.log("Successful");
    db = event.target.result;

    if (navigator.onLine) {
        console.log("Backend is Online");
        checkDatabase();
    }
};

const saveRec = (record) => {
    console.log("Saving Record");
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
    store.add(record);
};

window.addEventListener("online", checkDatabase)