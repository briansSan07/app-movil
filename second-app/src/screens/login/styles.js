const React = require("react-native");
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
const aspectRatio = deviceHeight/deviceWidth;

export default {
  imageContainer: {
    flex: 2,
    width: deviceWidth,
    height: null
  },
  logoContainer: {
    flex: 1,
    marginTop: deviceHeight / 15,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center'


  },
  logo: {
//    position: "absolute",
//(deviceWidth - 280)/3 
    left:  0, //(aspectRatio>1.6) ? ((deviceWidth/2) - 140) : ((deviceWidth/2) - 140),
//    top: Platform.OS === "android" ? 45 : 60,
    width: 280,
    height: 300,
    alignContent:"center"
  },
  text: {
    color: "#D8D8D8",
    bottom: 6,
    marginTop: 5
  }

};
