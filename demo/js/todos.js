getTodosListItems = (baseUrl) => {
    fetch(baseUrl)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const tableBody = document.querySelector("#todos-table tbody");

            data.map(row => {
                const tableRow = document.createElement("tr");
                tableRow.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.userId}</td>
                    <td>${row.title}</td>
                <td>${row.completed}</td>
                `;
                tableBody.append(tableRow);
            })
        })
        .catch((error) => {
            console.error("PROBLEM HAPPENED", error);
        })
}

getTodosListItems('https://jsonplaceholder.typicode.com/todos');