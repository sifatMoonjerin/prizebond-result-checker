const uploadBlock = document.getElementById('uploadBlock');
const resultBlock = document.getElementById('resultBlock');

document.getElementById('fileUploadButton').addEventListener("click", e => {
  e.preventDefault();
  document.getElementById('selectedFile').click();
})

document.getElementById('resetButton').addEventListener("click", e => {
  e.preventDefault();
  uploadBlock.classList.remove('hide-content');
  resultBlock.classList.add('hide-content');
})

document.getElementById('selectedFile').addEventListener("change", e => {
  const uploadedFile = e.target.files[0];
  
  modifyData(uploadedFile); 
})

function modifyData(file) {
  let fileReader = new FileReader();
  fileReader.readAsBinaryString(file);
  fileReader.onload = async event => {
    let fileData = event.target.result;
    const serialNumberArray = [];
    let workbook = XLSX.read(fileData, {type: "binary"});
    workbook.SheetNames.forEach(sheet => {
      XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]).map(rowObj => {
        const curNum = rowObj[Object.keys(rowObj)];
        serialNumberArray.push(pad(curNum));
      });
    });
    if (serialNumberArray.length) {
      const result = await getResults(getNumberChunks(serialNumberArray));
      displayResult(result);
    }
  }
}

function pad(num, size = 7) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function getNumberChunks(arr) {
  const totalNum = arr.length;
  let chunkCount = 0;
  const chunks = [];
  
  while (chunkCount < totalNum) {
    chunks.push(arr.slice(chunkCount, chunkCount + 100));
    chunkCount += 100;
  }

  return chunks;
}

function fetchData(arr) {
  return fetch(`https://proxy-datahub.herokuapp.com/getPrizeBondResults/${arr.slice(0, 100).join(',')}`)
          .then(res => res.json())
}

async function getResults(arr) {
  const loader = document.getElementById('loadingBlock');
  uploadBlock.classList.add('hide-content');
  loader.classList.remove('hide-content');
  const resultArr = await Promise.all(arr.map(a => fetchData(a)))
  loader.classList.add('hide-content');
  return resultArr.flat();
}

function buildTable(data) {

  const table = document.getElementById('resultTable');
  table.style.marginBottom = "0px";

  table.innerHTML = '';
  if (data.length > 0) {
    table.innerHTML += `
    <thead>
      <tr>
        <th scope="col">Number</th>
        <th scope="col">Draw</th>
        <th scope="col">Prize</th>
        <th scope="col">Amount</th>
      </tr>
    </thead>`;

    data.forEach(d => {
      const row = `
      <tr>
        <th>${d.Number}</th>
        <th>${d.Draw}</th>
        <th>${d.Prize}</th>
        <th>${d.Amount}</th>
      </tr>`;
      table.innerHTML += row; 
    })

    table.style.marginBottom = "20px";
  }
  
}

function displayResult(data) {
  resultBlock.classList.remove('hide-content');
  const message = document.getElementById('resultMessage');
  message.innerText = data.length > 0 ? 'Congratulations!!!' : 'Sorry! Better luck next time!';
  message.style.color = data.length > 0 ? 'green' : 'red';
  buildTable(data);
}
