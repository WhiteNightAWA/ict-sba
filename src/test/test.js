let data = [];
let datas = {};

for (let i = 0; i < 26; i++) {
    let table = data[i].rows;
    let group;
    for (let j = 0; j < table.length; j++) {
        let row = table[j];
        console.log(i, j);
        if (row.cells.length === 1) {
            group = row.cells[0].textContent.replaceAll("\n", "");
            group = group.split("（")[0] + (group.split("）同屬水果常被統稱為")[1] ? "/" + group.split("）同屬水果常被統稱為")[1] : "")
            datas[group] = []
        } else {
            if (row.cells[1].children.length === 0) {continue}
            let text = row.cells[1].children[0].children.length === 0 ? row.cells[1].children[0].textContent : row.cells[1].children[0].children[0].textContent;
            if (row.cells[2].textContent !== "\n") {
                text += "/" + row.cells[2].textContent.split("、").join("/").replaceAll("\n", "");
            }
            text.replaceAll(" ", "")
            text.replaceAll("\n", "")
            try {
                datas[group].push(text)
            } catch (err) {
                datas["其他水果"].push(text)
            }
        }
    }
}



let alldata = {}

let newData = {}
let Order, Family, Genus;
for (let i = 1; i < alldata.rows.length; i++) {
    let row = alldata.rows[i];
    let l = row.cells.length;
    console.log(l)
    switch (l) {
        case 4:
            Order = row.cells[0].textContent.split(" ")[0]
            newData[Order] = {}

            Family = row.cells[1].textContent.split(" ")[0]
            newData[Order][Family] = {}

            Genus = row.cells[2].textContent.split(" ")[0]
            if (Object.keys(datas).some(d => d.includes(Genus))) {
                Genus = Object.keys(datas).find(d => d.includes(Genus));
                newData[Order][Family][Genus] = datas[Genus]
            } else {
                newData[Order][Family][Genus] = row.cells[3].textContent.replaceAll("\n", "").split("、").map(w => w.split("（")[0]);
            }
            break
        case 3:
            Family = row.cells[0].textContent.split(" ")[0]
            newData[Order][Family] = {}

            Genus = row.cells[1].textContent.split(" ")[0]
            if (Object.keys(datas).some(d => d.includes(Genus))) {
                Genus = Object.keys(datas).find(d => d.includes(Genus));
                newData[Order][Family][Genus] = datas[Genus]
            } else {
                newData[Order][Family][Genus] = row.cells[2].textContent.replaceAll("\n", "").split("、").map(w => w.split("（")[0]);
            }
            break
        case 2:
            Genus = row.cells[0].textContent.split(" ")[0]
            if (Object.keys(datas).some(d => d.includes(Genus))) {
                Genus = Object.keys(datas).find(d => d.includes(Genus));
                newData[Order][Family][Genus] = datas[Genus]
            } else {
                newData[Order][Family][Genus] = row.cells[1].textContent.replaceAll("\n", "").split("、").map(w => w.split("（")[0]);
            }
            break

        case 1:
            console.error(row)
            break

    }
}

