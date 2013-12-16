
function GetFBAppID() {
    if (document.domain == "localhost") {
        return 301333090010352;//162391273949479;
    }
    else {
        return 1431638790386857;
    }
}
function ShareToFB(QueryStringParam, Image)
{
    //TODO: Get Image
    console.log('FB Image: ' + Image);
    LogFaceBookShare(QueryStringParam, Image, function (data) {
        //alert(data.toString());
        //alert('ShareToFB callback data: ' + data.toString());
        OpenFBSharePopUp(data.toString());
    });
    return false;
}

function OpenFBSharePopUp(ImageURL)
{

    //alert(FB);
    FB.ui({
        method: 'feed',
        link: 'www.GeometryHolidayCard.com?u=FB',
        picture: ImageURL,//'http://www.geometryholidaycard.com/img/test.png',
        //picture: 'http://www.geometryholidaycard.com/img/test.png',
        name: 'Happy Holidays from Geometry Global',
        caption: 'www.GeometryHolidayCard.com',
        description: 'I just made my holiday beautiful. Now it’s your turn!'
    }, function (response) { console.log('Share to FB Complete.'); });
}
function ShareToTwitter(QueryStringParam, Image)
{
    console.log("window.canvasEmpty: " + window.canvasEmpty);
    console.log('Twitter Image: ' + Image);
    LogTwitterShare(QueryStringParam, Image, '', '')
    console.log('Share to Twitter Complete.');
}

function ShowEmailForm()
{
    console.log('start show2');
    $('#emailForm').show();
    console.log('end show');
}