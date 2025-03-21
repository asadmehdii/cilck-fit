$(document).ready(() => {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $(".navbar").addClass("scrolled")
    } else {
      $(".navbar").removeClass("scrolled")
    }
  })

  $("a.nav-link").on("click", function (event) {
    if (this.hash !== "") {
      event.preventDefault()
      const hash = this.hash
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top - 70,
        },
        800,
      )
    }
  })

  $(".counter").counterUp({
    delay: 10,
    time: 1000,
  })

  function checkScroll() {
    $(".animate-on-scroll").each(function () {
      const position = $(this).offset().top
      const scroll = $(window).scrollTop()
      const windowHeight = $(window).height()
      const delay = $(this).data("delay") || 0

      if (scroll + windowHeight - 100 > position) {
        setTimeout(() => {
          $(this).addClass("show")
        }, delay)
      }
    })
  }

  checkScroll()

  $(window).scroll(() => {
    checkScroll()
  })

  $.ajax({
    url: "http://numbersapi.com/1/30/date?json",
    type: "GET",
    dataType: "json",
    success: (data) => {
      $("#fact-loader").hide()
      $("#fact-text").text(data.text)
    },
    error: (error) => {
      $("#fact-loader").hide()
      $("#fact-text").text("Could not load today's fact. Please try again later.")
    },
  })

  const uploadArea = document.getElementById("upload-area")
  const fileInput = document.getElementById("file-input")
  const uploadStatus = document.getElementById("upload-status")

  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, highlight, false)
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, unhighlight, false)
  })

  function highlight() {
    uploadArea.classList.add("highlight")
  }

  function unhighlight() {
    uploadArea.classList.remove("highlight")
  }

  uploadArea.addEventListener("drop", handleDrop, false)

  function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files
    handleFiles(files)
  }

  fileInput.addEventListener("change", function () {
    handleFiles(this.files)
  })

  uploadArea.addEventListener("click", () => {
    fileInput.click()
  })

  function handleFiles(files) {
    uploadStatus.innerHTML = ""

    if (files.length === 0) return

    Array.from(files).forEach(uploadFile)
  }

  function uploadFile(file) {
    if (!file.type.match("image.*")) {
      uploadStatus.innerHTML += `<div class="alert alert-danger">File "${file.name}" is not an image.</div>`
      return
    }

    const progressElement = document.createElement("div")
    progressElement.className = "mb-3"
    progressElement.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${file.name}</span>
                <span class="upload-percent">0%</span>
            </div>
            <div class="progress upload-progress">
                <div class="progress-bar bg-primary" role="progressbar" style="width: 0%"></div>
            </div>
        `
    uploadStatus.appendChild(progressElement)

    const progressBar = progressElement.querySelector(".progress-bar")
    const percentElement = progressElement.querySelector(".upload-percent")

    const formData = new FormData()
    formData.append("image", file)

    const xhr = new XMLHttpRequest()

    xhr.open("POST", "/upload", true)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        progressBar.style.width = percent + "%"
        percentElement.textContent = percent + "%"
      }
    })

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        addImageToGallery(response.imageUrl)
        progressElement.innerHTML = `<div class="alert alert-success">File "${file.name}" uploaded successfully!</div>`
      } else {
        progressElement.innerHTML = `<div class="alert alert-danger">Error uploading "${file.name}". Please try again.</div>`
      }
    }

    xhr.onerror = () => {
      progressElement.innerHTML = `<div class="alert alert-danger">Network error occurred while uploading "${file.name}".</div>`
    }

    xhr.send(formData)
  }

  function addImageToGallery(imageUrl) {
    const galleryContainer = document.getElementById("gallery-images")

    const colDiv = document.createElement("div")
    colDiv.className = "col-lg-4 col-md-6 mb-4"

    const galleryItem = document.createElement("div")
    galleryItem.className = "gallery-item animate-on-scroll show"

    const img = document.createElement("img")
    img.src = imageUrl
    img.alt = "Uploaded Image"
    img.className = "img-fluid"

    galleryItem.appendChild(img)
    colDiv.appendChild(galleryItem)

    galleryContainer.insertBefore(colDiv, galleryContainer.firstChild)
  }
})

