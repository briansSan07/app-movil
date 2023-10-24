import React from "react";

class DateUtils {

    fechaFormat(date,separator = ' ') {

        let dd   = date.getDate();
        let mm   = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        let hh   = date.getHours();
        let min  = date.getMinutes();
        let ss   = date.getSeconds();

        if(dd < 10){      dd = '0' + dd;    }
        if(mm < 10){      mm = '0' + mm;    }
        if(hh < 10){      hh = '0' + hh;    }
        if(min < 10){    min = '0' + min;   }
        if(ss < 10){      ss = '0' + ss;    }
    

        return yyyy+'-'+mm+'-'+dd + separator + hh+':'+min+':'+ss;
    }
}

module.exports = DateUtils;
