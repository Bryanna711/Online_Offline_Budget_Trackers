let db;

const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = () => {

};

request.onsuccess = () => {

};

request.onerror = () => {

};

const checkDatabase = () => {
    let transaction = db.transaction([""], "readwrite");

    const store = transaction.objectStore("");

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