const STORAGE_KEY = "dekubitusi-vrapce-cases";

const form = document.querySelector("#case-form");
const casesBody = document.querySelector("#cases-body");
const resetStorageButton = document.querySelector("#reset-storage");

const formatDate = (value) => value || "-";

const readFiles = (fileList) => {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    )
  );
};

const loadCases = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const saveCases = (cases) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
};

const renderPhotos = (photos) => {
  if (!photos || photos.length === 0) {
    return "-";
  }
  const container = document.createElement("div");
  container.className = "photo-list";
  photos.forEach((photo) => {
    const img = document.createElement("img");
    img.src = photo;
    img.alt = "Fotografija dekubitusa";
    container.appendChild(img);
  });
  return container;
};

const renderTable = (cases) => {
  casesBody.innerHTML = "";
  cases.forEach((caseItem, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${caseItem.caseId}</td>
      <td>${caseItem.fullName}</td>
      <td>${formatDate(caseItem.birthDate)}</td>
      <td>${caseItem.gender}</td>
      <td>${caseItem.department || "-"}</td>
      <td>${formatDate(caseItem.admissionDate)}</td>
      <td>${caseItem.mainDiagnosis || "-"}</td>
      <td>${caseItem.riskAtAdmission || "-"}</td>
      <td>${caseItem.acquiredInHospital}</td>
      <td>${formatDate(caseItem.ulcerDiagnosisDate)}</td>
      <td>${caseItem.ulcerStage || "-"}</td>
      <td>${caseItem.ulcerLocation || "-"}</td>
      <td>${formatDate(caseItem.dischargeDate)}</td>
      <td>${caseItem.treatmentOutcome || "-"}</td>
      <td>${caseItem.notes || "-"}</td>
      <td>${caseItem.daysInBed || "-"}</td>
      <td class="photo-cell"></td>
      <td><button class="action-button" data-index="${index}">Ukloni</button></td>
    `;
    const photoCell = row.querySelector(".photo-cell");
    const photosContent = renderPhotos(caseItem.photos);
    if (typeof photosContent === "string") {
      photoCell.textContent = photosContent;
    } else {
      photoCell.appendChild(photosContent);
    }
    casesBody.appendChild(row);
  });
};

const cases = loadCases();
renderTable(cases);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const photos = await readFiles(formData.getAll("photos"));

  const newCase = {
    caseId: formData.get("caseId").trim(),
    fullName: formData.get("fullName").trim(),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
    department: formData.get("department").trim(),
    admissionDate: formData.get("admissionDate"),
    mainDiagnosis: formData.get("mainDiagnosis").trim(),
    riskAtAdmission: formData.get("riskAtAdmission").trim(),
    acquiredInHospital: formData.get("acquiredInHospital"),
    ulcerDiagnosisDate: formData.get("ulcerDiagnosisDate"),
    ulcerStage: formData.get("ulcerStage").trim(),
    ulcerLocation: formData.get("ulcerLocation").trim(),
    dischargeDate: formData.get("dischargeDate"),
    treatmentOutcome: formData.get("treatmentOutcome").trim(),
    notes: formData.get("notes").trim(),
    daysInBed: formData.get("daysInBed"),
    photos,
  };

  cases.unshift(newCase);
  saveCases(cases);
  renderTable(cases);
  form.reset();
});

casesBody.addEventListener("click", (event) => {
  const button = event.target.closest(".action-button");
  if (!button) {
    return;
  }
  const index = Number(button.dataset.index);
  if (!Number.isNaN(index)) {
    cases.splice(index, 1);
    saveCases(cases);
    renderTable(cases);
  }
});

resetStorageButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Jeste li sigurni da želite obrisati sve spremljene slučajeve?"
  );
  if (!confirmed) {
    return;
  }
  cases.splice(0, cases.length);
  saveCases(cases);
  renderTable(cases);
});
