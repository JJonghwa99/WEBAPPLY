document.getElementById('profile_form').addEventListener('submit', async function (event) {
  event.preventDefault();
  const input = document.getElementById('input_profile');
  const files = input.files;

  if (!files.length) {
    alert('파일을 선택해 주세요.');
    return;
  }

  for (const file of files) {
    if (file.type !== 'text/plain') {
      alert('Only .txt files are allowed.');
      return;
    }
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append('input_profile', file);
  }

  try {
    const res = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const data = res.data.data;
    const fileNames = res.data.files;
    const groupedData = groupDataByCore(data);
    const coreStats = calculateStatistics(groupedData);
    const taskStats = calculateTaskStatistics(groupedData);

    renderFileList(fileNames);
    renderCoreButtons(coreStats.labels, groupedData, fileNames);
    renderTaskButtons(taskStats.numTasks, taskStats.labels, taskStats.datasets);
    renderChart(coreStats.labels, coreStats.datasets);
    document.getElementById('chart-container').style.display = 'block';

  } catch (err) {
    alert('파일 업로드에 실패했습니다.');
  }
});

function groupDataByCore(data) {
  const grouped = {};
  data.forEach(row => {
    const core = row[0];
    const values = row.slice(1).map(Number);

    if (!grouped[core]) {
      grouped[core] = [];
    }
    grouped[core].push(values);
  });
  return grouped;
}

function calculateStatistics(groupedData) {
  const labels = Object.keys(groupedData);
  const datasets = [];

  labels.forEach(core => {
    const coreData = groupedData[core];
    const numTasks = coreData[0].length;
    const min = Array(numTasks).fill(Infinity);
    const max = Array(numTasks).fill(-Infinity);
    const avg = Array(numTasks).fill(0);

    coreData.forEach(values => {
      values.forEach((value, index) => {
        if (value < min[index]) min[index] = value;
        if (value > max[index]) max[index] = value;
        avg[index] += value;
      });
    });

    avg.forEach((sum, index, arr) => {
      arr[index] = sum / coreData.length;
    });

    datasets.push({
      label: `${core} Min`,
      data: min,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    });

    datasets.push({
      label: `${core} Max`,
      data: max,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    });

    datasets.push({
      label: `${core} Avg`,
      data: avg,
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    });
  });

  return { labels, datasets };
}

function calculateTaskStatistics(groupedData) {
  const labels = Object.keys(groupedData);
  const datasets = [];
  const numTasks = groupedData[labels[0]][0].length;

  for (let i = 0; i < numTasks; i++) {
    const min = [];
    const max = [];
    const avg = [];

    labels.forEach(core => {
      const coreData = groupedData[core].map(row => row[i]);
      min.push(Math.min(...coreData));
      max.push(Math.max(...coreData));
      avg.push(coreData.reduce((a, b) => a + b, 0) / coreData.length);
    });

    datasets.push({
      label: `Task${i + 1} Min`,
      data: min,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    });

    datasets.push({
      label: `Task${i + 1} Max`,
      data: max,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    });

    datasets.push({
      label: `Task${i + 1} Avg`,
      data: avg,
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    });
  }

  return { numTasks, labels, datasets };
}

function renderFileList(fileNames) {
  const fileList = document.getElementById('file_list');
  fileList.innerHTML = '';
  fileNames.forEach(fileName => {
    const li = document.createElement('li');
    li.textContent = fileName;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger ms-2';
    deleteButton.textContent = '삭제';
    deleteButton.onclick = () => {
      clearData();
    };

    const fileItem = document.createElement('div');
    fileItem.className = 'd-flex align-items-center';
    fileItem.appendChild(li);
    fileItem.appendChild(deleteButton);

    fileList.appendChild(fileItem);
  });
}

function renderCoreButtons(labels, groupedData, fileNames) {
  const container = document.getElementById('core_buttons');
  container.innerHTML = '';
  labels.forEach(core => {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary m-1 core-button';
    button.textContent = core;
    button.onclick = () => {
      document.querySelectorAll('.core-button').forEach(btn => btn.classList.remove('btn-success'));
      document.querySelectorAll('.task-button').forEach(btn => btn.classList.remove('btn-success'));
      button.classList.add('btn-success');
      const stats = calculateStatistics({ [core]: groupedData[core] });
      document.getElementById('selected_info').innerHTML = `<strong>${fileNames.join()}의 ${core}의 값들입니다</strong>`;
      renderChart(stats.labels, stats.datasets);
    };
    container.appendChild(button);
  });
}

function renderTaskButtons(numTasks, labels, taskDatasets) {
  const container = document.getElementById('task_buttons');
  container.innerHTML = '';
  for (let i = 1; i <= numTasks; i++) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary m-1 task-button';
    button.textContent = `Task${i}`;
    button.onclick = () => {
      document.querySelectorAll('.task-button').forEach(btn => btn.classList.remove('btn-success'));
      document.querySelectorAll('.core-button').forEach(btn => btn.classList.remove('btn-success'));
      button.classList.add('btn-success');
      const taskData = taskDatasets.filter(dataset => dataset.label.startsWith(`Task${i}`));
      document.getElementById('selected_info').innerHTML =`<strong>Task${i}의 값들입니다</strong>`;
      renderChart(labels, taskData, true);
    };
    container.appendChild(button);
  }
}

function renderChart(labels, datasets, isTaskChart = false) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.myChart) {
    window.myChart.destroy();
  }
  window.myChart = new Chart(ctx, {
    type: selectedChartType,
    data: {
      labels: isTaskChart ? labels : ['Task1', 'Task2', 'Task3', 'Task4', 'Task5'],
      datasets: datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'black' // y축 글자 색상 변경
          }
        },
        x: {
          ticks: {
            color: 'black' // x축 글자 색상 변경
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'black' // 범례 글자 색상 변경
          }
        }
      }
    }
  });
}

document.getElementById('line').addEventListener('click', () => {
  document.querySelectorAll('.chart-button').forEach(btn => btn.classList.remove('btn-success'));
  document.getElementById('line').classList.add('btn-success');
  selectedChartType = 'line';
  updateChart();
});

document.getElementById('bar').addEventListener('click', () => {
  document.querySelectorAll('.chart-button').forEach(btn => btn.classList.remove('btn-success'));
  document.getElementById('bar').classList.add('btn-success');
  selectedChartType = 'bar';
  updateChart();
});

document.getElementById('pie').addEventListener('click', () => {
  document.querySelectorAll('.chart-button').forEach(btn => btn.classList.remove('btn-success'));
  document.getElementById('pie').classList.add('btn-success');
  selectedChartType = 'pie';
  updateChart();
});

function clearData() {
  document.getElementById('file_list').innerHTML = '';
  document.getElementById('core_buttons').innerHTML = '';
  document.getElementById('task_buttons').innerHTML = '';
  document.getElementById('selected_info').innerHTML = '';
  document.getElementById('chart-container').style.display = 'none';
  if (window.myChart) {
    window.myChart.destroy();
  }
}

let selectedChartType = 'line';

function updateChart() {
  const data = JSON.parse(sessionStorage.getItem('profileData'));
  if (data) {
    const groupedData = groupDataByCore(data);
    const coreStats = calculateStatistics(groupedData);
    const taskStats = calculateTaskStatistics(groupedData);
    renderChart(coreStats.labels, coreStats.datasets);
    renderCoreButtons(coreStats.labels, groupedData);
    renderTaskButtons(taskStats.numTasks, taskStats.labels, taskStats.datasets);
  }
}

getList();
