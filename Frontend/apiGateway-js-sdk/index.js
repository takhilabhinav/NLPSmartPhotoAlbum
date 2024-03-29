

var apigClient = apigClientFactory.newClient();
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

function voiceSearch(){
    if ('SpeechRecognition' in window) {
        console.log("SpeechRecognition is Working");
    } else {
        console.log("SpeechRecognition is Not Working");
    }
    
    var inputSearchQuery = document.getElementById("search_query");
    const recognition = new window.SpeechRecognition();
    //recognition.continuous = true;

    micButton = document.getElementById("mic_search");  
    
    if (micButton.innerHTML == "mic") {
        recognition.start();
    } else if (micButton.innerHTML == "mic_off"){
        recognition.stop();
    }

    recognition.addEventListener("start", function() {
        micButton.innerHTML = "mic_off";
        console.log("Recording.....");
    });

    recognition.addEventListener("end", function() {
        console.log("Stopping recording.");
        micButton.innerHTML = "mic";
    });

    recognition.addEventListener("result", resultOfSpeechRecognition);
    function resultOfSpeechRecognition(event) {
        const current = event.resultIndex;
        transcript = event.results[current][0].transcript;
        inputSearchQuery.value = transcript;
        console.log("transcript : ", transcript)
    }
}




function textSearch() {
    var searchText = document.getElementById('search_query');
    if (!searchText.value) {
        alert('Please enter a valid text or voice input!');
    } else {
        searchText = searchText.value.trim().toLowerCase();
        console.log('Searching Photos....');
        searchPhotos(searchText);
    }
    
}

function searchPhotos(searchText) {

    console.log(searchText);
    document.getElementById('search_query').value = searchText;
    document.getElementById('photos_search_results').innerHTML = "<h4 style=\"text-align:center\">";

    var params = {
        'q' : searchText
    };
    
    apigClient.searchGet(params, {}, {})
        .then(function(result) {
            console.log("Result : ", result);

            image_paths = result["data"];
            console.log("image_paths : ", image_paths);

            var photosDiv = document.getElementById("photos_search_results");
            photosDiv.innerHTML = "";

            var n;
            for (n = 0; n < image_paths.length; n++) {
                images_list = image_paths[n].split('/');
                imageName = images_list[images_list.length - 1];
                photosDiv.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';
            }
        }).catch(function(result) {
            var photosDiv = document.getElementById("photos_search_results");
            photosDiv.innerHTML = "Image not found!";
            console.log(result);
        });
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
}

function uploadPhoto() {
    var file = document.getElementById('uploaded_file').files[0];
    console.log(custom_labels.value);
    var file_data;
    var encoded_image = getBase64(file).then((data) => {
        console.log(data);
        var apigClient = apigClientFactory.newClient();

        var file_type = file.type + ';base64';
        //var file_type = file.type;

        console.log(file.type);

        var body = data;
        var params = {
        key: file.name,
            bucket: 'photosalbumb2',
            'Content-Type': file.type,
            'x-amz-meta-customLabels': custom_labels.value,
            Accept: 'image/*',
        };
        var additionalParams = {};
        apigClient
        .uploadBucketKeyPut(params, body, additionalParams)
        .then(function (res) {
            if (res.status == 200) {
            document.getElementById('uploadText').innerHTML =
                'Image Uploaded  !!!';
            document.getElementById('uploadText').style.display = 'block';
            }
      });
  });
}

/*
function uploadPhoto() {
    var filePath = (document.getElementById('uploaded_file').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    
    if (!document.getElementById('custom_labels').innerText == "") {
        var customLabels = document.getElementById('custom_labels');
    }
    console.log(fileName);
    console.log(custom_labels.value);

    var reader = new FileReader();
    var file = document.getElementById('uploaded_file').files[0];
    console.log('File : ', file);
    document.getElementById('uploaded_file').value = "";
    console.log("image/" + filePath.toString().split(".")[1])

    if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(filePath.toString().split(".")[1]))) {
        alert("Please upload a valid .png/.jpg/.jpeg file!");
    } else {

        var params = {
            'key': fileName,
            'bucket' : "b2-photos-album",
            'Content-Type': "image/" + filePath.toString().split(".")[1],
            'x-amz-meta-customLabels' : custom_labels.value,
            'Accept': 'image/*'
        };
        var additionalParams = {
        };
        
        reader.onload = function (event) {
            //body = btoa(event.target.result);
            body = btoa(event.target.result);
            //console.log('Reader body : ', body);
            return apigClient.uploadBucketKeyPut(params,body,additionalParams)
            .then(function(result) {
                console.log("result : ", result);
            })
            .catch(function(error) {
                console.log("error : " , error);
            })
        }
        reader.readAsBinaryString(file);
    }
}*/