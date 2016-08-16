var messageDeleteByUser = 'Сообщение удалено пользователем';
var messageDeleteBySystemSpam = 'Сообщение удалено системой(спам)';
var messageDeleteBySystemBadWords = 'Сообщение удалено системой(брань)';
var userVipStatus = 'неактивен';
var BIG = 'BIG';
var GROUP = 'GROUP';
var VIP = 'VIP';
var PRIVATE = 'PRIVATE';

$(document).ready(function () {

    // Connect to Clank
    var network = WS.connect(_WS_URI);

    network.on("socket/connect", function (session) {

        $("#send-token").bind("click", function(e){
            e.preventDefault();
            sendToken(session);
        });
        $("#go-to-room").bind("click", function(e){
            e.preventDefault();
            setRoom(session);
        });
        $("#go-to-vip-room").bind("click", function(e){
            e.preventDefault();
            setVipRoom(session);
        });

        $("#disconnect").bind("click", function(e){
            e.preventDefault();
            disconnect(session);
        });

    });

    network.on("socket/disconnect", function (session) {
        unbindUi();
    });

});

/**
 *
 * @param session
 */
function sendToken(session) {

    if($("#chat-input").val()) {
        disconnect(session);
    }
    var token = $("#user-token").val();
    authorize(session, token);

    $('#panelChat .panel-heading').html('You are connected to the General channel');
    $("#members-action").show();
}

/**
 *
 * @param session
 * @param token
 */
function authorize(session, token, chatId) {

    chatId = chatId || null;
    session.call('authorize/authorize', {token: token, chatId: chatId}).then(
        function (result) {
            result = result[0];
            if (result.status != 'OK') {
                alert('введите корректный токен');
                throw new Error(status.value);
            }
            if (result.type != 'user') {
                throw new Error('Invalid type. I want USER!!!');
            }

            var user = JSON.parse(result.value);
            if (user.vipStatus == "ROLE_VIP"){
                userVipStatus = 'активен';
            }


            $('#nickname').html(user.username);
            $('#username').html(user.username);
            $('#vip-status').html(userVipStatus);

            subscribeToRoom(session, user);
            bindUi(session, user);
            if (user.chatType == BIG){
                lastMessages(session, user);
                topUsers(session, user);
            }

            $("#chat-input").val("{\"chatId\": \"" + user.chatId + "\",\"type\": \"msg\",\"msg\": \"\"}");
        },
        function (error, desc) {
            console.log("RPC Error", error, desc);
        }
    );
}

/**
 *
 * @param session
 * @param user
 */
function subscribeToRoom(session, user) {
    session.subscribe('chat/postMessage/'+user.chatId, function (uri, payload) {
        var message = JSON.parse(payload.value);
        appendChat(session, message);
    });
}

/**
 *
 * @param session
 * @param message
 */
function appendChat(session, message) {

    var author = JSON.parse(message.author);
    var avatar = JSON.parse(message.avatar);
    var avatarUrl = '';
    if (avatar){
        avatarUrl = avatar.url;
    }
    var genderTermination = '';
    if(author.gender == 'female'){
        genderTermination = 'a';
    }
    if(author.birthday) {
        var dateBirthday = Date.parse(author.birthday);
        var ageDifMs = Date.now() - dateBirthday;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        var age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    var dateTimeArray = message.created_at.split(" ");
    var time = dateTimeArray[1].split(":");

    var messageText = message.message;
    if(message.deleted_at){
        messageText = messageDeleteByUser;
    }
    if(message.is_spam){
        messageText = messageDeleteBySystemSpam;
    }
    if(message.bad_words){
        messageText = messageDeleteBySystemBadWords;
    }

    if(message.audio){
        messageBlok = "</div><div id='" + message.id + "' class='messageText'><audio src="+ messageText +" controls> </audio>"
    } else {
        messageBlok = "</div><div id='" + message.id + "' class='messageText'>" + messageText;
    }

    var html = "<div style='padding-bottom: 10px;position: relative;'>" +
        "<div class='avatarChat'><img src='" + avatarUrl + "' width='40' height='40'/></div>" +
        "<div class='userChat'><div class='infoMessage'><span>" + author.username + "</span>" +
        " написал" + genderTermination + " в " + time[0] + ":" + time[1] + " " +
        messageBlok +
        "</div>" +
        "</div>" +
        "<div class='replyButton'><button id='" + author.id + "_" + message.id + "'>ответить</button></div>" +
        "</div>";

    $(".panel-body").append(html);

    $(".panel-body").scrollTop($('.panel-body').scrollHeight);

    $("#" + message.id + "").bind("click", function(e){
        e.preventDefault();
        deleteMessage(session, message);
    });

    $("#" + author.id + "_" + message.id + "").bind("click", function(e){
        e.preventDefault();
        $("#chat-input").val("\"chatId\": \"" + message.chatId + "\",\"type\": \"msg\",\"msg\":\"@" + author.username + ", "+"\"}");
        $("#chat-input").focus();
    });

}

/**
 *
 * @param session
 * @param message
 */
function deleteMessage(session, message) {
    session.subscribe('chat/deleteMessageTopic', function(uri, response) {
        console.log(uri, response, 'on delete message from topic');

    });

    session.call('message/deleteMessage', {id: message.id}).then(
        function(result) {
            result = result[0];
            if (result.status != 'OK') {
                throw new Error(status.value);
            }
            if (result.type != 'CommonBundle\\Entity\\Message\\Message') {
                throw new Error('Invalid type. I want MESSAGE!!!');
            }

            var message = JSON.parse(result.value);

            session.publish('chat/deleteMessageTopic', message.id);
            $("#" + message.id + "").replaceWith("<div id='" + message.id + "' class='messageText'>" + messageDeleteByUser +
                "</div>");
        },
        function (error) {
            console.log(error, 'cannot delete');
        }
    );
}

/**
 *
 * @param session
 */
function lastMessages(session, user) {
    session.call('messages/getLastMessages', {chatId : user.chatId}).then(
        function (response) {
            result = response[0];
            var messages = JSON.parse(result.value);

            messages.forEach(function(item, i, messages) {
                appendChat(session, item);
            });
        },
        function (error) {
            console.log('message list', error);
        }
    );
}

/**
 *
 * @param session
 * @param user
 */
function topUsers(session, user){
    session.call('chat/topUsers/topUsers', {chatId : user.chatId}).then(
        function (response) {
            var result = response[0];
            var users = JSON.parse(result.value);
            var usersToText = '';
            users.forEach(function(item, i, users) {
                var avatar = '';
                if(item.avatar){
                    avatar = item.avatar.url;
                }

                usersToText = usersToText +
                    "<div>" +
                    "<div class='avatarChat'><img src='" + avatar + "' width='50' height='50'/></div>" +
                    "<div class='userChat' style='width: 120px;'>" + item.username + "</div>" +
                    "</div>";
            });
            $("#topUsers").replaceWith(usersToText);
        },
        function (error) {
            console.log('top user list', error);
        }
    );
}

/**
 *
 * @param session
 */
function setRoom(session){
    disconnect(session);
    goToRoom(session, 0);
}

/**
 *
 * @param session
 */
function setVipRoom(session){
    disconnect(session);
    goToRoom(session, 1);
}

/**
 *
 * @param session
 * @param vip
 */
function goToRoom(session, vip){
    var token = $("#user-token").val();
    session.call('chat/goToRoom/goToRoom', {token: token, vip: vip}).then(
        function(result) {
            result = result[0];
            var chat = JSON.parse(result.value);

            var chatId = chat.chatId;

            if(vip == 1 && chat.vipStatus[0] != "ROLE_VIP"){
                alert("Для того, чтобы попасть в VIP чат, необходимо приобрести VIP статус")
            }
            if(chatId) {
                authorize(session, token, chatId);
                $(".panel-body").empty();
                $("#members-action").hide();

            }
        },
        function (error) {
            console.log(error, 'cannot link to room');
        }
    );
}

/**
 *
 * @param session
 * @param user
 */
function whoOnline(session, user){

    session.call('chat/whoOnline/whoOnline', {chatId : user.chatId}).then(
        function (response) {

            var result = response[0];
            var users = JSON.parse(result.value);
            var usersToText = '';
            users.forEach(function(item, i, users) {
                usersToText = usersToText + "\n" + item.username;
            });
            alert("Сейчас на сайте:" + usersToText);
        },
        function (error) {
            console.log('online user list', error);
        }
    );
}

/**
 *
 * @param session
 */
function publishChat(session, user) {

    var msg = $("#chat-input").val();
    $("#chat-input").val("{\"chatId\": \"" + user.chatId + "\",\"type\": \"msg\",\"msg\":\"\"}");
    var messageObject = JSON.parse(msg);
    if(messageObject.msg){
        session.publish('chat/postMessage/'+user.chatId, msg);
    }
}

/**
 *
 * @param session
 */
function disconnect(session){
    var token = $("#user-token").val();
    var messageObject = JSON.parse($("#chat-input").val());
    var chatId =messageObject.chatId;
    session.call('chat/disconnect/disconnect', {token: token, chatId: chatId}).then(
        function(result) {
            result = result[0];
            var userChat = JSON.parse(result.value);
            $(".panel-body").empty();
            session.unsubscribe('chat/postMessage/'+userChat.chatId);
            unbindUi();
        },
        function (error) {
            console.log(error, 'cannot link to room');
        }
    );

}

/**
 *
 * @param session
 */
function bindUi(session, user) {
    $("#chat-input").bind("keypress", function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) { //Enter keycode
            publishChat(session, user);
        }
    });
    $("#who-online").bind("click", function(e){
        e.preventDefault();
        whoOnline(session);
    });
}

function unbindUi() {
    $("#join-chat").unbind();
    $("#chatroom").unbind();

    $("#send-chat").unbind();
    $("#chat-input").unbind();

    $("#nickname > input").unbind();
    $("#nickname > a").unbind();
}
