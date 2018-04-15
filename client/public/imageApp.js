//Image Fetch Scripts and Dependencies
firebase.initializeApp({
  apiKey: 'AIzaSyCWrPGPYuFbk9URlxlmOBOHCMJisVgRkT8',
  authDomain: 'matchinggame-8aab2.firebaseapp.com',
  projectId: 'matchinggame-8aab2'
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

      // Require the client

// const Clarifai = require('clarifai');

// initialize with your api key. This will also work in your browser via http://browserify.org/

const appClar = new Clarifai.App({
 apiKey: 'aef7d663b6b84ad28b50dd57efed3780'
});

appClar.inputs.delete().then(
  function(response) {
    // do something with response
  },
  function(err) {
    // there was an error
  }
);

window.fbAsyncInit = function() {
  FB.init({
    appId            : 'matchingGame',
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v2.12'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

 var photolist = []
 var myalbums = []
 var tempResp = []

 var tempRespFinal = []
 var tempRespImg = []

 var pairedPhotos = []

 var numofImages = 0
 var numofpross = 0

 function sleep(miliseconds) {
    var currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
 }

 function goToGame() {
    sleep(500)
    $(".se-pre-con").fadeOut("slow");

 }

 function makeFacebookPhotoURL( id, accessToken ) {
   return 'https://graph.facebook.com/' + id + '/picture?access_token=' + accessToken;
 }

 function addPhotoToDB(userid, photoid, time, url) {
   $(".se-pre-con").fadeIn("fast");

   // Add a new document in collection "cities"
   db.collection(userid).doc(photoid).set({
       id: photoid,
       time: time,
       url: url
   })
   .then(function() {
       console.log("Document successfully written!");
       numofpross+=1

       if (numofpross>=numofImages) {
         doImageAnalysis()
       }
   })
   .catch(function(error) {
       console.error("Error writing document: ", error);
   });
 }

 function doImageAnalysis() {
   var urlList = []

   for (var j=0; j<photolist.length; j++){
     urlList.push({'url': photolist[j].url})
   }

   appClar.inputs.create(urlList).then(
     function(response) {
       tempResp = response

       sleep(1000)
       // do something with response
       for (var j=0; j<photolist.length; j++) {
         var tempurll = photolist[j].url
         appClar.inputs.search({ input: {url: tempurll} }).then(
           function(response) {
             tempRespImg = response
             if (tempRespImg.hits[1].score > 0.8) {
                 // var image = document.createElement('img');
                 // image.src = tempRespImg.hits[0].input.data.image.url;
                 // document.body.appendChild(image);
                 //
                 // image = document.createElement('img');
                 // image.src = tempRespImg.hits[1].input.data.image.url;
                 // document.body.appendChild(image);

                 pairedPhotos.push({
                   'url1': tempRespImg.hits[0].input.data.image.url,
                   'url2'	:	tempRespImg.hits[1].input.data.image.url
                 })
             }
             // do something with response
           },
           function(err) {
             // there was an error
           }
         );
         sleep(10)
       }


       goToGame()

     },
     function(err) {
       // there was an error
     }
   );



 }



 document.addEventListener('DOMContentLoaded', function() {
   // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
   // // The Firebase SDK is initialized and available here!
   //
   // firebase.auth().onAuthStateChanged(user => { });
   // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
   // firebase.messaging().requestPermission().then(() => { });
   // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
   //
   // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

   try {
     let app = firebase.app();
     // let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
     document.getElementById('load').innerHTML = `Firebase SDK loaded`;

     // FirebaseUI config.
     var uiConfig = {
       callbacks: {
         signInSuccessWithAuthResult: function(authResult, redirectUrl) {
           var user = authResult.user;
           var credential = authResult.credential;
           var isNewUser = authResult.additionalUserInfo.isNewUser;
           var providerId = authResult.additionalUserInfo.providerId;
           var operationType = authResult.operationType;
           // Do something with the returned AuthResult.
           // Return type determines whether we continue the redirect automatically
           // or whether we leave that to developer to handle.
           // document.getElementById('load').innerHTML= user.uid
           // FB.api(
           //     "/me/photos",
           //     {
           //       access_token : credential.accessToken,
           //       additional_parameter_foo : 'bar'
           //     },
           //     function(photos){
           //       photolist = photos
           //       if (photos && photos.data && photos.data.length){
           //         for (var j=0; j<photos.data.length; j++){
           //           var photo = photos.data[j];
           //           // photo.picture contain the link to picture
           //           var image = document.createElement('img');
           //           image.src = makeFacebookPhotoURL(photo.id, credential.accessToken);
           //           document.body.appendChild(image);
           //         }
           //       }
           //     }
           //     // function (response) {
           //     //   if (response && !response.error) {
           //     //     document.getElementById('load').innerHTML= response
           //     //     photolist = response
           //     //   }
           //     // }
           // );

           FB.api('/me/albums',
             {
               access_token : credential.accessToken,
               additional_parameter_foo : 'bar'
             },
             function(response) {
               myalbums = response
               for (var i=0; i<response.data.length; i++) {
                 var album = response.data[i];
                   FB.api('/'+album.id+'/photos',
                     {
                       access_token : credential.accessToken,
                       additional_parameter_foo : 'bar'
                     },
                     function(photos){
                       if (photos && photos.data && photos.data.length){
                         numofImages = numofImages + photos.data.length
                         for (var j=0; j<photos.data.length; j++){
                           var photo = photos.data[j];
                           // photo.picture contain the link to picture
                           // var image = document.createElement('img');
                           // image.src = makeFacebookPhotoURL(photo.id, credential.accessToken);
                           // document.body.appendChild(image);

                           photolist.push({
                             'id'	:	photo.id,
                             'added'	:	photo.created_time,
                             'url'	:	makeFacebookPhotoURL(photo.id, credential.accessToken)
                           });

                           addPhotoToDB(user.uid, photo.id, photo.created_time, makeFacebookPhotoURL(photo.id, credential.accessToken))
                         }
                       }
                   });
               }
             }
           );

           // doImageAnalysis()

           return false;
         },
         signInSuccess: function(currentUser, credential, redirectUrl) {
           // This callback will be deprecated. `signInSuccessWithAuthResult` should
           // be used instead.
           // Do something.
           // Return type determines whether we continue the redirect automatically
           // or whether we leave that to developer to handle.
           return true;
         },
         signInFailure: function(error) {
           // Some unrecoverable error occurred during sign-in.
           // Return a promise when error handling is completed and FirebaseUI
           // will reset, clearing any UI. This commonly occurs for error code
           // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
           // occurs. Check below for more details on this.
           return handleUIError(error);
         },
         uiShown: function() {
           // The widget is rendered.
           // Hide the loader.
           document.getElementById('loader').style.display = 'none';
         }
       },
       credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
       // Query parameter name for mode.
       queryParameterForWidgetMode: 'mode',
       // Query parameter name for sign in success url.
       queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
       // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
       signInFlow: 'redirect',
       // signInSuccessUrl: 'redirectUrl',
       signInOptions: [
         // Leave the lines as is for the providers you want to offer your users.
         // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
         {
           provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
           scopes: [
             'public_profile',
             'email',
             'user_photos'
           ],
         },
       ],
       // Terms of service url.
       tosUrl: '<your-tos-url>'
     };

     // Initialize the FirebaseUI Widget using Firebase.
     var ui = new firebaseui.auth.AuthUI(firebase.auth());
     // The start method will wait until the DOM is loaded.
     ui.start('#firebaseui-auth-container', uiConfig);

   } catch (e) {
     console.error(e);
     document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
   }
 });
