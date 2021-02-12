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
  const resultArr = await Promise.all(arr.map(a => fetchData(a)))
  console.log(resultArr)
  return resultArr.flat();
}

function buildTable(data) {

  const table = document.getElementById('resultTable');
  table.style.marginBottom = "0px";

  table.innerHTML = '';
  if (data.length > 0) {
    table.innerHTML += `
    <tr>
      <th scope="col">Number</th>
      <th scope="col">Draw</th>
      <th scope="col">Prize</th>
      <th scope="col">Amount</th>
    </tr>`;

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
  uploadBlock.classList.add('hide-content');
  resultBlock.classList.remove('hide-content');
  const message = document.getElementById('resultMessage');
  message.innerText = data.length > 0 ? 'Congratulations!!!' : 'Sorry! Better luck next time!';
  message.style.color = data.length > 0 ? 'green' : 'red';
  buildTable(data);
}


// document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
//   const dropZoneElement = inputElement.closest(".drop-zone");

//   dropZoneElement.addEventListener("click", (e) => {
//     inputElement.click();
//   });

//   inputElement.addEventListener("change", (e) => {
//     if (inputElement.files.length) {
//       updateThumbnail(dropZoneElement, inputElement.files[0]);
//     }
//   });

//   dropZoneElement.addEventListener("dragover", (e) => {
//     e.preventDefault();
//     dropZoneElement.classList.add("drop-zone--over");
//   });

//   ["dragleave", "dragend"].forEach((type) => {
//     dropZoneElement.addEventListener(type, (e) => {
//       dropZoneElement.classList.remove("drop-zone--over");
//     });
//   });

//   dropZoneElement.addEventListener("drop", (e) => {
//     e.preventDefault();

//     if (e.dataTransfer.files.length) {
//       const isExcel = /([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/.test(e.dataTransfer.files[0].name);
//       if (isExcel) {
//         inputElement.files = e.dataTransfer.files;
//         updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
//       }
//     }

//     dropZoneElement.classList.remove("drop-zone--over");
//   });
// });


// function updateThumbnail(dropZoneElement, file) {
//   const test = /([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/.test(file.name);
//   let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

//   // First time - remove the prompt
//   if (dropZoneElement.querySelector(".drop-zone__prompt")) {
//     dropZoneElement.querySelector(".drop-zone__prompt").remove();
//   }

//   // First time - there is no thumbnail element, so lets create it
//   if (!thumbnailElement) {
//     thumbnailElement = document.createElement("div");
//     thumbnailElement.classList.add("drop-zone__thumb");
//     dropZoneElement.appendChild(thumbnailElement);
//   }

//   thumbnailElement.dataset.label = file.name;

//   // Show thumbnail for image files
//   // if (file.type.startsWith("image/")) {
//   //   const reader = new FileReader();

//   //   reader.readAsDataURL(file);
//   //   reader.onload = () => {
//   //     thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
//   //   };
//   // } else {
//   //   thumbnailElement.style.backgroundImage = null;
//   // }
// }
