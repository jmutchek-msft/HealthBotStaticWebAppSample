const defaultLocale = 'en-US';

// main function called from UI that initiates the request for a chatbot connection
// - calls the chatBot API (query params optional) to retrieve connection details from server
//      - locale
//      - userName
//      - userId
// - rationale is that the server will have authoritative info and might do additional authZ
function requestChatBot() {
    const params = new URLSearchParams(location.search);
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initBotConversation);
    var path = "/api/chatBot?locale=" + extractLocale(params.get('locale'));

    if (params.has('userId')) {
        path += "&userId=" + params.get('userId');
    }
    if (params.has('userName')) {
        path += "&userName=" + params.get('userName');
    }
    oReq.open("POST", path);
    oReq.send();
}

// callback function triggered by requestChatBot()
// initiates chatbot connection
async function initBotConversation() {
    if (this.status >= 400) {
        alert(this.statusText);
        return;
    }

    // extract the data from the JWT
    // currently, this returns the userId, userName, and locale but could also be enhanced 
    // to include the bot authentication token as well
    const jsonWebToken = this.response;
    const tokenPayload = JSON.parse(atob(jsonWebToken.split('.')[1]));
    const user = {
        id: tokenPayload.userId,
        name: tokenPayload.userName,
        locale: tokenPayload.locale
    };

    console.log(`user info returned from /api/chatBot:`)
    console.log(user)

    // retrieve a token from the server process
    // making this request keeps the bot SECRET out of the client web page
    // alternatively, the previous call to /api/chatBot could return the token in tokenPayload
    const res = await fetch('/api/token', 
        { 
            method: 'POST',
            headers: {
                'content-type': "application/json"
            },
            body: {
                "user": {
                    "id": user.id,
                    "name": user.name
                }
            }
        }
        );
    const { token } = await res.json();

    var botConnection = window.WebChat.createDirectLine({ token });
    const styleOptions = {
        botAvatarImage: 'https://docs.microsoft.com/en-us/azure/bot-service/v4sdk/media/logo_bot.svg?view=azure-bot-service-4.0',
        hideSendBox: false, /* set to true to hide the send box from the view */
        botAvatarInitials: 'Bot',
        userAvatarInitials: 'You',
        backgroundColor: '#F8F8F8'
    };

    const webchatOptions = {
        directLine: botConnection,
        styleOptions: styleOptions,
        locale: user.locale
    };

    startChat(user, webchatOptions);
}

function startChat(user, webchatOptions) {
    const botContainer = document.getElementById('webchat');
    window.WebChat.renderWebChat(webchatOptions, botContainer);
}



function extractLocale(localeParam) {
    if (!localeParam) {
        return defaultLocale;
    }
    else if (localeParam === 'autodetect') {
        return navigator.language;
    }
    else {
        return localeParam;
    }
}

