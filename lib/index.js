window.onload = function () {
    function toexeshare() {
        var strHref=window.location.href;
        var strHrefShare=strHref.substr(0,strHref.indexOf('#'));
        //      微信二次分享
        var wShare = {};
        wShare.shareImg = 'https://i1.yongche.Name/media/g2/M03/00/1D/rBEBJVdngbqIagETAABqiclQEwcAAALoQP6a7IAAGqh129.png';
        wShare.shareTitle = '易到专车 车主招募';
        wShare.shareContent = '始于专车 忠于易到';
        wShare.shareUrl = strHrefShare;
        wxShareFn(wShare);
        if (window.navigator.userAgent.indexOf("YongChe")> -1){
            ajaxShare({
                url: strHrefShare,//TODO
                title: '易到专车 车主招募',
                description: '始于专车 忠于易到'
            });
        }
    }
    function stop(e){
        e.preventDefault();
    }
    function get_cookie(Name) {
        var search = Name + "="//查询检索的值
        var returnvalue = "";//返回值
        if (document.cookie.length > 0) {
            sd = document.cookie.indexOf(search);
            if (sd!= -1) {
                sd += search.length;
                end = document.cookie.indexOf(";", sd);
                if (end == -1)
                    end = document.cookie.length;
                returnvalue=unescape(document.cookie.substring(sd, end))
            }
        }
        return returnvalue;
    }
    function isLogin() {
        rootScope.car_master_id = get_cookie('car_master_id');
        // rootScope.car_master_id='7168955orxycow04'//TODO
        if(rootScope.car_master_id){
            return true;
        }else {
            return false;
        }
    }
    var Login = {
        template: '#login',
        data: function(){
            return {
                isaggree:false,
                tishi:false,
                xieyi:false,
                telNumber:'',
                codeNumber:'',
                //audiS:true
            }
        },
        computed: {
        },
        watch:{
        },
        ready:function () {
            this.get_msgcode=$('.get-msgcode');
            this.stopBub();
            toexeshare();
        },
        methods: {
            stopBub:function () {
                setTimeout(function () {
                    $("body").delegate(".stopPop","touchstart",function(event){
                        document.getElementById('app').addEventListener('touchmove',stop,false);
                    });
                    $("body").delegate(".stopPop","touchend",function(event){
                        document.getElementById('app').removeEventListener('touchmove',stop,false)
                    });
                },30)
            },
            getCode:function () {
                if (!(/^1(?:[38]\d{3}|4[57]\d{2}|5[0-35-9]\d{2}|6[68]\d{2}|7(?:[0-35-8]\d{2}|40[0-5])|9[89]\d{2})\d{6}$/.test(this.telNumber))) {
                    faileHint($('.loginBox'),'请输入正确手机号');
                    return false;
                }
                this.countdowndown();
                this.checkCode();
            },
            sureHandle:function () {
                var vm=this;
                if (!vm.checkMobile(vm.telNumber)) {
                    //alert('请输入正确手机号');
                    faileHint($('.loginBox'),'请输入正确手机号');
                    return fasle;
                }
                if (!vm.codeNumber) {
                    // alert('请输入短信验证码');
                    faileHint($('.loginBox'),'请输入短信验证码');
                    return false;
                }
                if(!vm.isaggree){
                    vm.tishi=true;
                    return false;
                }
                $.ajax({
                    url: ajaxUrl+'/Common/SignUpiDriver',
                    type: 'post',
                    //dataType: 'jsonp',
                    data:{cellphone:vm.telNumber,authCode:vm.codeNumber},
                    success: function (data) {
                        if(data.code==200){//登录成功
                            if(data.msg.ret_code==200 || data.msg.ret_code==203){//(全新加盟or已经处于加盟流程中)返回司机信息
                                //data.msg.result.auditStatus=1//TODO
                                if(data.msg.result.auditStatus==1){//waiting
                                    window.location.href='./audiW.html';
                                    return;
                                }
                                if(data.msg.result.auditStatus==10){//success
                                    window.location.href='./audiS.html';
                                    return;
                                }
                                rootScope = Object.assign({}, rootScope,data.msg.result);
                                // vm.$router.go('/drawinfo');
                                router.go({ name: 'drawinfo'});
                            }else if(data.msg.ret_code==501 || data.msg.ret_code==500){
                                faileHint($('.loginBox'),data.msg.ret_msg);
                            }else if(data.msg.ret_code==201){
                                faileHint($('.loginBox'),'验证码错误，请重新输入');
                            }else if(data.msg.ret_code==202){
                                //faileHint($('.loginBox'),'已经是司机，请下载客户端体验司机');
                                window.location.href='./audiS.html';
                            }else{
                                faileHint($('.loginBox'),'未知错误');
                            }
                        }else if(data.code==499){
                            faileHint($('.loginBox'),'参数异常');
                        }else {
                            faileHint($('.loginBox'),'登录失败');
                        }
                    },
                    error: function (err) {
                        faileHint($('.loginBox'),'网络异常');
                    }
                })
            },
            checkMobile:function (number) {
                if (!(/^1(?:[38]\d{3}|4[57]\d{2}|5[0-35-9]\d{2}|6[68]\d{2}|7(?:[0-35-8]\d{2}|40[0-5])|9[89]\d{2})\d{6}$/.test(number))) {
                    return false;
                }
                return true;
            },
            countdowndown:function () {
                var vm=this;
                var count = 59;
                var countdown = setInterval(CountDown, 1000);
                function CountDown() {
                    vm.get_msgcode.attr("disabled", true);
                    vm.get_msgcode.css("color", "#e1e1e1");
                    vm.get_msgcode.val(count + "s后再获取");
                    if (count == 0) {
                        vm.get_msgcode.val("获取验证码").removeAttr("disabled");
                        vm.get_msgcode.css("color", "#FF5252");
                        clearInterval(countdown);
                    }
                    count--;
                }
            },
            checkCode:function () {
                var vm=this;
                $.ajax({
                    type: 'post',
                    url: ajaxUrl+'/Common/CreateAuthCode',
                    dataType: 'json',
                    data:{cellphone:vm.telNumber},
                    success: function (data) {
                        if (data.code == 200) {
                            if(data.msg.ret_code==200){
                                faileHint($('.loginBox'),'验证码已发送');
                            }else {
                                faileHint($('.loginBox'),data.msg.ret_msg);
                            }
                        } else if (data.code == 499) {
                            faileHint($('.loginBox'),'操作频繁，请稍后再试');
                        } else{
                            faileHint($('.loginBox'),'未知错误');
                        }
                    },
                    error: function (err) {
                        faileHint($('.loginBox'),'请求异常');
                    }
                })
            },
            closetishi:function () {
                this.tishi=false;
            },
            closexieyi:function () {
                this.xieyi=false;
            },
            showxieyi:function () {
                this.xieyi=true;
            },
            downloadapp:function () {
                var u = navigator.userAgent;
                var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
                var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                var link = '';
                link = 'http://d.yongche.com';
                isiOS && (link = 'https://appsto.re/cn/zwVq8.i');
                window.location.href=link;
            }
        }
    };
    var Drawinfo = {
        template: '#drawinfo',
        data: function(){
            return {
                xingship:false,
                jiaship:false,
                cherenp:false,
                wangyuez:false,
                audiF:false,
                carbrand:'',
                carb:'',
                carx:'',
                carcolor:'',
                carBrand:'',
                license_time:'',
                license_time_str:'',
                car_time:'',
                car_time_str:'',
                carNumSelect:'京 A',
                carNum:'',
                ifdone:'',
                registerName:'',
                id_card:'',
                chezhuName:'',
                cityList:'',
                wenzhoumsg:false,
                carBrandId:'',
                carModelId:'',
                carColor:'',
                photoId:'',
                identityImgId:'',
                identityBackImgId:'',
                driverLicenseImgId:'',
                carLicenseImgId:'',
                driverImgId:'',
                networkDriverImg1:'',
                networkDriverImg2:'',
                networkTransportImg1:'',
                networkTransportImg2:'',
                networkTransportImg3:'',
                timecar:false,
                timeren:false,
                jiatime:3,
                cartime:8,
                ifneedWangyue:true,
                auditFailReason:{},
                preloading:true,
                personalVal:'',
                touxiangp:false
            }
        },
        watch:{
            carbrand:function () {
                var newarea = this.carbrand.split(' ');//
                this.carb = newarea[0];
                this.carx= newarea[1];
                this.carcolor = newarea[2];
                this.carBrand=this.carb+this.carx;
                this.carBrandId=this.brand_list[this.area2.value[0]].value;
                this.carModelId=this.carListObg[this.carBrandId][this.area2.value[1]].value;
                this.carColor=this.color_list[this.carModelId][this.area2.value[2]].value;
            },
            personalVal:function (curVal,oldVal) {
                if(curVal==oldVal){
                    return;
                }
                this.getConfig(curVal);
            }
        },
        computed: {
            ifdone:function () {
                if(this.registerName && this.id_card && this.carNum && this.carbrand && this.chezhuName && this.license_time && this.car_time && this.photoId && this.identityImgId && this.identityBackImgId && this.driverLicenseImgId && this.carLicenseImgId){
                    if(this.ifneedWangyue && !$('#wangyuep').hasClass("done")){
                        return false;
                    }
                    return true;
                }else {
                    return false;
                }
            }
        },
        ready: function() {
            if(!rootScope.car_master_id && !rootScope.register_code){
                window.location='yidaodriver://closeWindow';
            }
            toexeshare();
            this.stopBub();
            var vm=this;
            this.timeSelet();
            //rootScope.auditStatus=20//TODO
            if(rootScope.auditStatus==20){//fail
                if(this.auditFailReason){
                    this.auditFailReason=JSON.parse(rootScope.auditFailReason);
                }
                this.audiF=true;
                this.preloading=false;
                // $('input[type=file]').attr('disabled','disabled');
                this.fuzhi();
            }
            if(rootScope.auditStatus==0){
                this.fuzhi();
                this.preloading=false;
            }
            var swiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                spaceBetween: 35,
            });
            this.initData();
            if(!rootScope.car_master_id){
                this.citySelet();
                this.inicarColor();
                // this.getgeolo();
            }
            this.carNumSelet();
            this.toseepic();
            if (window.navigator.userAgent.indexOf("YongChe")> -1) {
                this.initGloFun();
                this.inputProtocal();
            } else {
                this.iniinput();
            }
        },
        methods: {
            stopBub:function () {
                setTimeout(function () {
                    $("body").delegate(".stopPop","touchstart",function(event){
                        document.getElementById('app').addEventListener('touchmove',stop,false);
                    });
                    $("body").delegate(".stopPop","touchend",function(event){
                        document.getElementById('app').removeEventListener('touchmove',stop,false)
                    });
                },30)
            },
            initData:function () {
                if(rootScope.car_master_id){
                    var vm=this;
                    $.ajax({
                        type: 'get',
                        url: ajaxUrl+'/Common/GetDriverRegisterInfo',
                        dataType: 'json',
                        data:{s_car_master_id:rootScope.car_master_id},
                        success: function (data) {
                            if (data.code == 200) {
                                if(data.msg.ret_code==200){
                                    if(data.msg.result.auditFailReason){
                                        data.msg.result.auditFailReason=JSON.parse(data.msg.result.auditFailReason)
                                    };
                                    rootScope = Object.assign({}, rootScope,data.msg.result);
                                    //data.msg.result.auditStatus=1//TODO
                                    if(data.msg.result.auditStatus==1){//waiting
                                        window.location.href='./audiW.html';
                                        return;
                                    }
                                    if(data.msg.result.auditStatus==10){//success
                                        window.location.href='./audiS.html';
                                        return;
                                    }
                                    if(data.msg.result.auditStatus==20){//fail
                                        vm.auditFailReason=data.msg.result.auditFailReason;
                                        vm.audiF=true;
                                        // $('input[type=file]').attr('disabled','disabled');
                                    }else {
                                        vm.citySelet();
                                        //vm.getgeolo();
                                    }
                                    vm.preloading=false;
                                    //rootScope.carBrandId=15;//TODO
                                    // rootScope.carModelId=161;//TODO
                                    vm.fuzhi();
                                    vm.inicarColor();
                                }else {
                                    faileHint($('.infoBox'),data.msg.ret_msg);
                                }
                            } else if (data.code == 499) {
                                faileHint($('.infoBox'),data.msg.ret_msg);
                            } else{
                                faileHint($('.infoBox'),'未知错误');
                            }
                        },
                        error: function (err) {
                            alert(err)
                        }
                    })
                }
            },
            fuzhi:function () {
                var vm=this;
                vm.registerName=rootScope.name;
                vm.chezhuName=rootScope.vehicleOwnerName;
                vm.id_card=rootScope.identityCard;
//                if(rootScope.city && vm.cityList){
//                    $('#personal').mobiscroll('setVal',rootScope.city, true);
//                    $('#personal_dummy').val(rootScope.short);
//                    $('#personal').val(rootScope.city);
//                    console.log('fuzhicityed')
//                }
                if(rootScope.licenseStartDate){
                    var time = new Date(parseInt(rootScope.licenseStartDate)*1000);
                    var M = time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1) : time.getMonth()+1;
                    var D = time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate();
                    var dateFormate = time.getFullYear() + '-' + M + '-' + D;
                    vm.license_time=dateFormate;
                    var arr1=dateFormate.split('-');
                    $('#select_time').mobiscroll('setDate', new Date(arr1[0], arr1[1]-1, arr1[2], 0, 0, 0, 0), true);
                    vm.license_time_str=rootScope.licenseStartDate;
                }
                if(rootScope.carRegisterTime){
                    var time2 = new Date(parseInt(rootScope.carRegisterTime)*1000);
                    var M2 = time2.getMonth()+1 < 10 ? '0'+(time2.getMonth()+1) : time2.getMonth()+1;
                    var D2 = time2.getDate() < 10 ? '0' + (time2.getDate()) : time2.getDate();
                    var dateFormate2 = time2.getFullYear() + '-' + M2 + '-' + D2;
                    vm.car_time=dateFormate2;
                    var arr2=dateFormate2.split('-');
                    $('#car_time').mobiscroll('setDate', new Date(arr2[0], arr2[1]-1, arr2[2], 0, 0, 0, 0), true);
                    vm.car_time_str=rootScope.carRegisterTime;

                }
                if( rootScope.vehicleNumber && rootScope.vehicleNumber.length>=3){
                    vm.carNum=rootScope.vehicleNumber.substring(2);
                    $('.select-value2').val(rootScope.vehicleNumber.substring(0,2).split("").join(" "))
                }
                if(rootScope.photoId){
                    $('#head_img_id').val(true);
                    $('.headImg').attr('src',rootScope.photoId);
                    $('.head2').attr('src',rootScope.photoId);
                    $('#headp').html('已上传').addClass("done");
                    vm.photoId=true;
                    $('.head2')[0].onload=function () {
                        vm.auto(this)
                    }

                }
                if(rootScope.identityImgId && rootScope.identityBackImgId){
                    $('.shenfenz1').attr('src',rootScope.identityImgId);
                    $('.shenfenz2').attr('src',rootScope.identityBackImgId);
                    $('#shenfenp').html('已上传').addClass("done");
                    $('#shenfenz_img_id').val(true);
                    $('#shenfenz_back_img_id').val(true);
                    vm.identityImgId=true;
                    vm.identityBackImgId=true;
                    $('.shenfenz1')[0].onload=function () {
                        vm.auto(this)
                    }
                    $('.shenfenz2')[0].onload=function () {
                        vm.auto(this)
                    }
                }
                if(rootScope.driverLicenseImgId){
                    $('.jiashiz').attr('src',rootScope.driverLicenseImgId);
                    $('#jiaship').html('已上传').addClass("done");
                    $('#jiashiz_img_id').val(true);
                    vm.driverLicenseImgId=true;
                    $('.jiashiz')[0].onload=function () {
                        vm.auto(this)
                    }
                }
                if(rootScope.carLicenseImgId){
                    $('.xingshiz').attr('src',rootScope.carLicenseImgId);
                    $('#xingship').html('已上传').addClass("done");
                    $('#xingshiz_img_id').val(true);
                    vm.carLicenseImgId=true;
                    $('.xingshiz')[0].onload=function () {
                        vm.auto(this)
                    }
                }
                if(rootScope.driverImgId){
                    $('.renchez').attr('src',rootScope.driverImgId);
                    $('#renchep').html('已上传').addClass("done");
                    $('#renchez_img_id').val(true);
                    vm.driverImgId=true;
                    $('.renchez')[0].onload=function () {
                        vm.auto(this)
                    }
                }
                if(rootScope.networkDriverImg1 || rootScope.networkDriverImg2 || rootScope.networkTransportImg1 || rootScope.networkTransportImg2 || rootScope.networkTransportImg3){
                    $('#wangyuep').html('已上传').addClass("done");
                }
                if(rootScope.networkDriverImg1){
                    $('.fileElem1').attr('src',rootScope.networkDriverImg1);
                    $('#jia_img_id').val(true);
                }
                if(rootScope.networkDriverImg2){
                    $('.fileElem2').attr('src',rootScope.networkDriverImg2);
                    $('#jia_back_img_id').val(true);
                }
                if(rootScope.networkTransportImg1){
                    $('.fileElem3').attr('src',rootScope.networkTransportImg1);
                    $('#yun_img_id').val(true);
                }
                if(rootScope.networkTransportImg2){
                    $('.fileElem4').attr('src',rootScope.networkTransportImg2);
                    $('#yun_back_img_id').val(true);
                }
                if(rootScope.networkTransportImg3){
                    $('.fileElem5').attr('src',rootScope.networkTransportImg3);
                    $('#yun_backed_img_id').val(true);
                }
            },
            inicarColor:function () {
                var vm=this;
                vm.brand_list = [];
                vm.carListObg = {};
                vm.color_list = {};
                var colorType = ["其他", "黑色", "白色", "银色", "红色", "蓝色", "黄色", "灰色", "咖啡色", "香槟金", "绿色", "紫色", "粉色"]
                $.ajax({
                    type:"get",
                    url: ajaxUrl+'/Common/GetAllCarBrand',
                    dataType: 'json',
                    data:{register_code:rootScope.register_code},
                    success:function(data){
                        if(data.code==200 && data.msg.ret_code==200){
                            vm.brand_list=data.msg.result.brand_list
                            vm.carListObg = data.msg.result.car_list;
                            for(var key in vm.carListObg){
                                for(var i=0; i<vm.carListObg[key].length; i++){
                                    var colorkey = vm.carListObg[key][i]['value'];
                                    vm.color_list[colorkey] = [];
                                    for(var k=1; k<colorType.length;k++){
                                        var tempObj = {};
                                        tempObj['text'] = colorType[k];
                                        tempObj['value'] = k;
                                        vm.color_list[colorkey].push(tempObj);
                                    }
                                }
                            }
                            vm.$nextTick(function () {
                                //carbarnd select
                                vm.area2 = new LArea();//carbrand选择初始化
                                vm.area2.init({
                                    'trigger': '#carbrand',
                                    'keys': {
                                        id: 'value',
                                        name: 'text'
                                    },
                                    'type': 2,
                                    'data': [vm.brand_list, vm.carListObg, vm.color_list]
                                });
                                if(rootScope.carBrandId && rootScope.carModelId && rootScope.carColor){
                                    var x,y,z;
                                    var x1,y1,z1;
                                    for(var i in vm.brand_list){
                                        if(vm.brand_list[i].value==rootScope.carBrandId){
                                            x=i;
                                            x1=vm.brand_list[i].text;
                                            var city=vm.carListObg[vm.brand_list[i].value];
                                            for(var j in city){
                                                if(city[j].value==rootScope.carModelId){
                                                    y=j;
                                                    y1=city[j].text;
                                                    var district=vm.color_list[city[j].value];
                                                    for(var k in district){
                                                        if(district[k].value==rootScope.carColor){
                                                            z=k;
                                                            z1=district[k].text;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    vm.area2.value=[x,y,z];
//                                    $('#carbrand').val(x1+','+y1+','+'z1');
                                    vm.carbrand=x1+' '+y1+' '+z1;
                                    vm.carBrand=x1+y1;
                                }
                            })
                        }else {
                            faileHint($('.infoBox'),'服务器错误')
                        }
                    },
                    error:function(){
                        faileHint($('.infoBox'),'请求异常')
                    }
                });
            },
            uploadImg2:function (file,method,$li) {
                var vm=this;
                var formdata = new FormData();
                var url,data;
                var url=ajaxUrl+'/Common/ImgRegister';
                var data={
                    register_code:rootScope.register_code,
                    method:method
                }
                if(method=='photoId'){
                    url=ajaxUrl+'/Common/UploadPhoto';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                if(method=='identityImgId'){
                    url=ajaxUrl+'/Common/UploadIdentity';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                if(method=='identityBackImgId'){
                    url=ajaxUrl+'/Common/UploadIdentityBack';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                if(method=='driverLicenseImgId'){
                    url=ajaxUrl+'/Common/UploadDriverLicense';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                if(method=='carLicenseImgId'){
                    url=ajaxUrl+'/Common/UploadCarLicense';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                if(method=='driverImgId'){
                    url=ajaxUrl+'/Common/UploadDriver';
                    data={
                        register_code:rootScope.register_code,
                    }
                }
                formdata.append('data',encodeURIComponent(JSON.stringify(data)));
                formdata.append('img',file);
                $li.attr('disabled','disabled');
                $li.siblings('.uploadProgress').show();
                $.ajax({
                    type:'post',
                    url: url,
                    data:formdata,
                    processData: false,
                    contentType : false,
                    async:true,
                    success:function(data) {
                        if(data.code==200){
                            if(data.msg.ret_code==200){
                                var result=data.msg.result;
                                var img_url = data.msg.result.img_url;
                                $('.'+$li.attr('id')).attr("src",img_url);
                                if($('.'+$li.attr('id')).parent().hasClass("picbox") || $('.'+$li.attr('id')).parent().hasClass("swiper-slide")){
                                    $('.'+$li.attr('id'))[0].onload=function () {
                                        vm.auto(this)
                                    }
                                }
                                if($li.attr('id')=='head1'){
                                    $('.head2')[0].onload=function () {
                                        vm.auto(this)
                                    }
                                }
                                faileHint($('.infoBox'),'上传成功')
                                $li.siblings('.uploadProgress').hide();
                                $li.removeAttr("disabled");
                                if($li.attr('data-tan')){
                                    $('.'+$li.attr('data-tan')).css({'z-index':-1,'opacity':0});
                                    if($li.attr('data-tan')=='shenfenz'){
                                        $('.shenfenT').css({'z-index':-1,'opacity':0});
                                    }
                                }
                                if($li.attr('data-p')){
                                    $('#'+$li.attr('data-p')).html('已上传').addClass("done");
                                }
                                if($li.parent().hasClass("chuan")){
                                    $('#wangyuep').html('已上传').addClass("done");
                                }
                                if($li.attr('id')=='shenfenz1'){
                                    $('.shenfenT').css({'z-index':10,'opacity':1});
                                }
                                $li.siblings('input[type=hidden]').val(true);
                                $li.siblings('input[type=hidden]')[0].dispatchEvent(new Event('input'))
                                if(method=='identityImgId'){
                                    vm.registerName=result.name;
                                    vm.id_card=result.idCardNo
                                }
                                if(method=='driverLicenseImgId'){
                                    if(result.firstIssueDate){
                                        var date=result.firstIssueDate;
                                        var str=date.substr(0,4)+'-'+date.substr(4,2)+'-'+date.substr(6,2)
                                        vm.license_time=str;
                                        var str1=str.replace(/-/g,'/')
                                        vm.license_time_str=parseInt(new Date(str1).getTime()/1000);
                                        var firstarr1=str.split('-');
                                        $('#select_time').mobiscroll('setDate', new Date(firstarr1[0], firstarr1[1]-1, firstarr1[2], 0, 0, 0, 0), true);
                                    }
                                }
                                if(method=='carLicenseImgId'){
                                    vm.chezhuName=result.carOwner;
                                    if(result.registerDate){
                                        var datecar=result.registerDate;
                                        var strcar=datecar.substr(0,4)+'-'+datecar.substr(4,2)+'-'+datecar.substr(6,2)
                                        vm.car_time=strcar;
                                        var strcar1=strcar.replace(/\-/g,'/')
                                        vm.car_time_str=parseInt(new Date(strcar1).getTime()/1000);
                                        var registerarr2=strcar.split('-');
                                        $('#car_time').mobiscroll('setDate', new Date(registerarr2[0], registerarr2[1]-1, registerarr2[2], 0, 0, 0, 0), true);
                                    }
                                    if(result.vehicleNumber.length>=2){
                                        vm.carNum=result.vehicleNumber.substring(2);
                                        $('.select-value2').val(result.vehicleNumber.substring(0,2).split("").join(" "))
                                    }
                                }
                            }else if(data.msg.ret_code==401 || data.msg.ret_code==601 || data.msg.ret_code==502 || data.msg.ret_code==503 || data.msg.ret_code==402 || data.msg.ret_code==501 || data.msg.ret_code==500 || data.msg.ret_code==499){
                                $li.siblings('.uploadProgress').hide();
                                faileHint($('.infoBox'),data.msg.ret_msg);
                                $li.removeAttr("disabled");
                            }else {
                                $li.siblings('.uploadProgress').hide();
                                faileHint($('.infoBox'),'上传失败，请检查网络设置是否正常');
                                $li.removeAttr("disabled");
                            }

                        } else{
                            $li.siblings('.uploadProgress').hide();
                            faileHint($('.infoBox'),data.msg);
                            $li.removeAttr("disabled");
                        }
                    },
                    error:function() {
                        $li.siblings('.uploadProgress').hide();
                        faileHint($('.infoBox'),'上传失败，请检查网络设置是否正常')
                        $li.removeAttr("disabled");
                    }
                });
            },
            iniinput:function () {
                var vm=this;
                $("#head1").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'photoId',$(this));
                    e.target.value=null;
                });
                $("#shenfenz1").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'identityImgId',$(this));
                    e.target.value=null;
                });
                $("#shenfenz2").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'identityBackImgId',$(this));
                    e.target.value=null;
                });
                $("#jiashiz").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'driverLicenseImgId',$(this));
                    e.target.value=null;
                });
                $("#xingshiz").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'carLicenseImgId',$(this));
                    e.target.value=null;
                });
                $("#renchez").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'driverImgId',$(this));
                    e.target.value=null;
                });
                $("#fileElem1").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'networkDriverImg1',$(this));
                    e.target.value=null;
                });
                $("#fileElem2").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'networkDriverImg2',$(this));
                    e.target.value=null;
                });
                $("#fileElem3").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'networkTransportImg1',$(this));
                    e.target.value=null;
                });
                $("#fileElem4").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'networkTransportImg2',$(this));
                    e.target.value=null;
                });
                $("#fileElem5").change(function(e) {
                    var file = this.files[0];
                    vm.uploadImg2(file,'networkTransportImg3',$(this));
                    e.target.value=null;
                });
            },
            inputProtocal:function () {
                var version = navigator.userAgent.substr(navigator.userAgent.indexOf("YongChe")).split(" ")[0].split("/")[1]
                console.log(version)
                //alert(version)
                version = version.split(".");
                if(version[0]<8 || (version[1] < 3 && version[0]==8) ){
                    alert("您当前版本过低，将无法上传图片,请先升级易到App！")
                    //return;
                }
                $('input[type=file]').on('click',function() {
                    var id = $(this).attr('id');
                    var data={
                        register_code:rootScope.register_code,
                    };
                    if(id == 'head1'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadPhoto')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'shenfenz1'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadIdentity')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'shenfenz2'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadIdentityBack')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'jiashiz'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadDriverLicense')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'xingshiz'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadCarLicense')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'renchez'){
                        window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/UploadDriver')+'&data='+encodeURIComponent(JSON.stringify(data));
                        return false;
                    }
                    if(id == 'fileElem1') {
                        data={
                            method:"networkDriverImg1",
                            register_code:rootScope.register_code
                        }
                    }
                    if(id == 'fileElem2') {
                        data={
                            method:"networkDriverImg2",
                            register_code:rootScope.register_code
                        }
                    }
                    if(id == 'fileElem3') {
                        data={
                            method:"networkTransportImg1",
                            register_code:rootScope.register_code
                        }
                    }
                    if(id == 'fileElem4') {
                        data={
                            method:"networkTransportImg2",
                            register_code:rootScope.register_code
                        }
                    }
                    if(id == 'fileElem5') {
                        data={
                            method:"networkTransportImg3",
                            register_code:rootScope.register_code
                        }
                    }
                    window.location.href = 'yongche://uploadProtocol?callback=uploadHeadImage&imageId='+id+'&uploadUrl='+encodeURIComponent(ajaxUrl+'/Common/ImgRegister')+'&data='+encodeURIComponent(JSON.stringify(data));
                    return false;
                })
            },
            initGloFun:function () {
                var vm=this;
                window.uploadHeadImage=function (code,file_id,data) {
                    var $li=$('#' + file_id);
                    if(code == file_id) {
                        //$('#' + file_id).siblings(".uploadProgress").show();//上传中loading效果
                    } else if(code == 'failure') {
                        $('#' + file_id).siblings('.uploadProgress').hide();
                        faileHint($('.infoBox'),'上传失败，请检查网络设置是否正常')
                    } else {
                        if (code == 200) {
                            // res=JSON.parse(decodeURIComponent(data))
                            var res=JSON.parse(decodeURIComponent(data)).msg;
                            //console.log(res)//打印返回data.msg
                            if(res.ret_code==200){
                                var result=res.result;
                                var img_url = result.img_url;
                                $('.'+file_id).attr("src",img_url);
                                if($('.'+file_id).parent().hasClass("picbox") || $('.'+$li.attr('id')).parent().hasClass("swiper-slide")){
                                    $('.'+file_id)[0].onload=function () {
                                        vm.auto(this)
                                    }
                                }
                                if(file_id=='head1'){
                                    $('.head2')[0].onload=function () {
                                        vm.auto(this)
                                    }
                                }
                                faileHint($('.infoBox'),'上传成功')
                                $li.siblings('.uploadProgress').hide();
                                if($li.attr('data-tan')){
                                    $('.'+$li.attr('data-tan')).css({'z-index':-1,'opacity':0});
                                    if($li.attr('data-tan')=='shenfenz'){
                                        $('.shenfenT').css({'z-index':-1,'opacity':0});
                                    }
                                }
                                if($li.attr('data-p')){
                                    $('#'+$li.attr('data-p')).html('已上传').addClass("done");
                                }
                                if($li.parent().hasClass("chuan")){
                                    $('#wangyuep').html('已上传').addClass("done");
                                }
                                if($li.attr('id')=='shenfenz1'){
                                    $('.shenfenT').css({'z-index':10,'opacity':1});
                                }
                                $li.siblings('input[type=hidden]').val(true);
                                $li.siblings('input[type=hidden]')[0].dispatchEvent(new Event('input'))
                                if(file_id=='shenfenz1'){
                                    vm.registerName=result.name;
                                    vm.id_card=result.idCardNo
                                }
                                if(file_id=='jiashiz'){
                                    if(result.firstIssueDate){
                                        var date=result.firstIssueDate;
                                        var str=date.substr(0,4)+'-'+date.substr(4,2)+'-'+date.substr(6,2)
                                        vm.license_time=str;
                                        var str1=str.replace(/\-/g,'/')
                                        vm.license_time_str=parseInt(new Date(str1).getTime()/1000);
                                        var firstarr1=str.split('-');
                                        $('#select_time').mobiscroll('setDate', new Date(firstarr1[0], firstarr1[1]-1, firstarr1[2], 0, 0, 0, 0), true);
                                    }
                                }
                                if(file_id=='xingshiz'){
                                    vm.chezhuName=result.carOwner;
                                    if(result.registerDate){
                                        var datecar=result.registerDate;
                                        var strcar=datecar.substr(0,4)+'-'+datecar.substr(4,2)+'-'+datecar.substr(6,2)
                                        vm.car_time=strcar;
                                        var strcar1=strcar.replace(/\-/g,'/')
                                        vm.car_time_str=parseInt(new Date(strcar1).getTime()/1000);
                                        var registerarr2=strcar.split('-');
                                        $('#car_time').mobiscroll('setDate', new Date(registerarr2[0], registerarr2[1]-1, registerarr2[2], 0, 0, 0, 0), true);
                                    }
                                    if(result.vehicleNumber.length>=2){
                                        vm.carNum=result.vehicleNumber.substring(2);
                                        $('.select-value2').val(result.vehicleNumber.substring(0,2).split("").join(" "))
                                    }
                                }
                            }else if(res.ret_code==401 || res.ret_code==601 ||res.ret_code==502 || res.ret_code==503 || res.ret_code==402 || res.ret_code==501 || res.ret_code==500 || res.ret_code==499){
                                $li.siblings('.uploadProgress').hide();
                                faileHint($('.infoBox'),res.ret_msg)
                            }else {
                                $li.siblings('.uploadProgress').hide();
                                faileHint($('.infoBox'),'上传失败，请检查网络设置是否正常')
                            }
                        } else {
                            $li.siblings('.uploadProgress').hide();
                            faileHint($('.infoBox'),'上传失败，请检查网络设置是否正常')
                        }
                    }
                }
            },
            citySelet:function () {
                var vm=this;
                //city select
                $.ajax({
                    url:ajaxUrl+'/Common/GetDriverServiceCity',
                    type:'get',
                    dataType:"json",
                    data:{register_code:rootScope.register_code},
                    success:function(data){
                        if(data.code==200 && data.msg.ret_code==200){
                            vm.cityList=data.msg.result;
                            //vm.cityList.splice(1 - 1, 1,...vm.cityList.splice(2 - 1, 1, vm.cityList[1 - 1]));
                            vm.$nextTick(function () {
                                $('#personal').mobiscroll().select({
                                    theme: 'ios7',
                                    inputClass: 'xs7 pt z',
                                    placeholder:'请选择',
                                    lang: 'zh',
                                    height: 70,
                                    display: 'bottom',
                                    closeOnOverlay:false,
                                    mode: 'scroller',
                                    onSelect:function(valueText, inst){
//                                        console.log($('#personal_dummy').val())
//                                        console.log($('#personal').val())
                                        $('#personal')[0].dispatchEvent(new Event('change'));
                                        $('.mbsc-ios7 .dwo').css({'background':'rgba(0,0,0,.2)'})
                                    },
                                    onShow: function (event, inst) {
                                        $('.mbsc-ios7 .dwo').css({'background':'rgba(0,0,0,.8)'})
                                    },
                                    onCancel: function (event, inst) {
                                        $('.mbsc-ios7 .dwo').css({'background':'rgba(0,0,0,.2)'})
                                    },
                                    onChange: function (event, inst) {

                                    }
                                });
                            });
                            if(rootScope.city){
                                // $('#personal').mobiscroll('setVal',rootScope.city, true);
                                // $('#personal_dummy').val(rootScope.short);
                                $('#personal').val(rootScope.city);
                                vm.personalVal=rootScope.city;
                            }else {
                                vm.getgeolo();
                            }
                        }else {
                            faileHint($('.infoBox'),data.msg.ret_msg);
                        }
                    },
                    error:function () {
                        faileHint($('.infoBox'),'网络异常');
                    }
                })
            },
            timeSelet:function () {
                //time select
                var vm=this;
                var myDate=new Date();
                window.currentTime = parseInt(myDate.getTime() / 1000);
                var A=$("#select_time");
                var B=$("#car_time");
                A.mobiscroll().date({
                    theme: "ios7",
                    lang: "zh",
                    display: "bottom",
                    mode: "scroller",
                    yearSuffix: "<em>年</em>",
                    daySuffix: "<em>日</em>",
                    dateOrder: "YYMMdd",
                    height: 70,
                    closeOnOverlay:false,
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date((currentTime - 365 * 100 * 24 * 3600) * 1000),
                    maxDate: new Date(currentTime * 1000),
                    onSelect: function(C, D) {
                        var timeSec = A.mobiscroll('getDate').getTime();
                        var time = new Date(timeSec);
                        var M = time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1) : time.getMonth()+1;
                        var D = time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate();
                        var dateFormate = time.getFullYear() + '-' + M + '-' + D;
                        //$('#select_time').attr('value', dateFormate);
                        vm.license_time=dateFormate;
                        vm.license_time_str=timeSec/1000;
                        vm.timeren=false;
                    },
                    onShow: function (event, inst) {
                        vm.timeren=true;
                    },
                    onCancel: function (event, inst) {
                        vm.timeren=false;
                    }
                });
                B.mobiscroll().date({
                    theme: "ios7",
                    lang: "zh",
                    display: "bottom",
                    mode: "scroller",
                    yearSuffix: "<em>年</em>",
                    daySuffix: "<em>日</em>",
                    dateOrder: "YYMMdd",
                    height: 70,
                    closeOnOverlay:false,
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date((currentTime - 365 * 100 * 24 * 3600) * 1000),
                    maxDate: new Date(currentTime * 1000),
                    onSelect: function(C, D) {
                        var timeSec = B.mobiscroll('getDate').getTime();
                        var time = new Date(timeSec);
                        var M = time.getMonth()+1 < 10 ? '0'+(time.getMonth()+1) : time.getMonth()+1;
                        var D = time.getDate() < 10 ? '0' + (time.getDate()) : time.getDate();
                        var dateFormate = time.getFullYear() + '-' + M + '-' + D;
                        //$('#select_time').attr('value', dateFormate);
                        vm.car_time=dateFormate;
                        vm.car_time_str=timeSec/1000;
                        vm.timecar=false;
                    },
                    onShow: function (event, inst) {
                        vm.timecar=true;
                    },
                    onCancel: function (event, inst) {
                        vm.timecar=false;
                    }
                });
            },
            carNumSelet:function () {
                var vm=this;
                //carNum select
                $('.select-value2').mPicker({
                    level: 2,
                    dataJson: level3,
                    rows: 5,
                    height:70,
                    Linkage: false,
                    header: '<div class="mPicker-header"><a href="javascript:;" class="mPicker-cancel">取消</a><a href="javascript:;" class="mPicker-confirm">确定</a></div>',
                    footer:'',
                    idDefault: true,
                    confirm: function () {
                        //console.log(vm.carNumSelect)
                        //console.log($('.select-value2').val())//提交这个val
                    }
                })
            },
            idCard: function (val) {//验证身份证号
                var id = String(val),
                    $WS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
                    $_modMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
                    $sum = 0;
                var $id_17 = id.substring(0, 17);
                var $id_last = id.substring(17, 18);
                var $len_WS = $WS.length;
                for (var i = 0; i < $len_WS; i++) {
                    $sum = $sum + $id_17[i] * $WS[i];
                }
                ;
                var last_num = $sum % 11;
                return $_modMap[last_num] == $id_last.toUpperCase();
            },
            checkName: function (val) {
                var name = /^[a-zA-Z\u4E00-\u9FA5·]{1,50}$/ //仅限文字，字母，maxlength = 50;
                return val && val.match(name)
            },
            checkCarNum: function (val) {
                //var licensePlate = /^[A-Za-z]{1}[A-Za-z_0-9]{5}$/;
                var licensePlate = /^[A-Za-z_0-9]{4,6}$/;
                return val && val.match(licensePlate)
            },
            totouxiang:function (e) {
                if(!$(e.target).hasClass("done")){
                    $('.touxiang').css({'z-index':10,'opacity':1});
                }
                this.touxiangp=false;
            },
            toshenfen:function (e) {
                if(!$(e.target).hasClass("done")){
                    $('.shenfenz').css({'z-index':10,'opacity':1});
                }
                $('.shenfenp').css({'z-index':-1,'opacity':0});
            },
            qxshenfenz:function () {
                $('.shenfenz').css({'z-index':-1,'opacity':0});
            },
            tojiashi:function (e) {
                if(!$(e.target).hasClass("done")){
                    $('.jiashizz').css({'z-index':10,'opacity':1});
                }
                this.jiaship=false;
            },
            qxjiashiz:function () {
                $('.jiashizz').css({'z-index':-1,'opacity':0});
            },
            qxtouxiang:function () {
                $('.touxiang').css({'z-index':-1,'opacity':0});
            },
            toxingshi:function (e) {
                if(!$(e.target).hasClass("done")){
                    $('.xingshizz').css({'z-index':10,'opacity':1});
                }
                this.xingship=false;
            },
            qxxingshiz:function () {
                $('.xingshizz').css({'z-index':-1,'opacity':0});
            },
            torenche:function (e) {
                if(!$(e.target).hasClass("done")){
                    $('.renchehez').css({'z-index':10,'opacity':1});
                }
                this.cherenp=false;
            },
            qxrenchez:function () {
                $('.renchehez').css({'z-index':-1,'opacity':0});
            },
            towangyue:function () {
                this.wangyuez=true;
            },
            closewangyue:function () {
                this.wangyuez=false;
            },
            toseepic:function () {
                var vm=this;
                $('.toseepics').delegate(".done","click",function(){
                    var id=$(this).attr('id');
                    if(id=='jiaship'){
                        vm.jiaship=true;
                    }
                    if(id=='shenfenp'){
                        $('.shenfenp').css({'z-index':10,'opacity':1});
                    }
                    if(id=='xingship'){
                        vm.xingship=true;
                    }
                    if(id=='renchep'){
                        vm.cherenp=true;
                    }
                    if(id=='headp'){
                        vm.touxiangp=true;
                    }

                });
            },
            surexingshi:function () {
                this.xingship=false;
            },
            surejiashi:function () {
                this.jiaship=false;
            },
            surecheren:function () {
                this.cherenp=false;
            },
            surehead:function () {
                this.touxiangp=false;
            },
            sureshenfen:function () {
                $('.shenfenp').css({'z-index':-1,'opacity':0});
            },
            getgeolo:function () {
                var vm=this;
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function(r){
                    if(this.getStatus() == BMAP_STATUS_SUCCESS){
                        console.log('您的位置：'+r.point.lng+','+r.point.lat);
                        vm.showPosition(r.point.lng,r.point.lat)
                    }
                    else {
                        alert('failed'+this.getStatus());
                    }
                },{enableHighAccuracy: true})
            },
            getConfig:function (val) {
                var vm=this;
                $.ajax({
                    url:ajaxUrl+'/Common/GetConfigByCity',
                    type:'get',
                    dataType:"json",
                    data:{city:val,register_code:rootScope.register_code},
                    success:function(data){
                        if(data.code==200 && data.msg.ret_code==200){
                            var result=data.msg.result;
                            vm.jiatime=result.licenseAge;
                            vm.cartime=result.carAge;
                            if(result.showCondition==1){
                                vm.wenzhoumsg=true;
                            }
                            vm.ifneedWangyue=!!result.uploadLicense;
                        }else if(data.code==200 && (data.msg.ret_code==501 || data.msg.ret_code==500)){
                            faileHint($('.infoBox'),data.msg.ret_msg);
                        }else {
                            faileHint($('.infoBox'),'网络异常');
                        }
                    },
                    error:function () {
                        faileHint($('.infoBox'),'网络异常');
                    }
                })
            },
            closewenzhoumsg:function () {
                this.wenzhoumsg=false;
            },
            showPosition:function (lng,lat) {
                var vm=this;
                $.ajax({
                    url:ajaxUrl+'/Common/GetCityByCoordinate',
                    type:'get',
                    dataType:"json",
                    data:{lat:lat,lng:lng,register_code:rootScope.register_code,coord_type:'baidu'},
                    success:function(data){
                        if(data.code==200 && data.msg.ret_code==200){
                            $('#personal_dummy').val(data.msg.result.city);
                            $('#personal').val(data.msg.result.short);
                            $('#personal')[0].dispatchEvent(new Event('change'));
                        }else {
                            faileHint($('.infoBox'),data.msg.ret_msg);
                        }
                    },
                    error:function () {
                        faileHint($('.infoBox'),'网络异常');
                    }
                })
            },
            checkjiaTime:function (str1,time) {
                var offset=(new Date().getTime())/1000-str1;
                var years = offset / 60 / 60 / 24 / 365 ;
                // console.log(years,offset / 60 / 60 / 24 / 365 ,offset,time,str1)
                return years >= time
            },
            checkcarTime:function (str1,time) {
                var offset=(new Date().getTime())/1000-str1;
                var years = offset / 60 / 60 / 24 / 365 ;
                //console.log(years,offset / 60 / 60 / 24 / 365 ,offset,time,str1)
                return years <= time
            },
            tijiao:function (e) {
                var vm=this;
                var vehicleNumber=$('.select-value2').val().split(" ").toString().replace(',','')+this.carNum;
                var iftrue=true;
                if(!this.checkName(this.registerName)){
                    faileHint($('.infoBox'),'请输入正确的姓名')
                    iftrue=false;
                    return;
                }
                if(!this.idCard(this.id_card)){
                    faileHint($('.infoBox'),'请输入正确的身份证号')
                    iftrue=false;
                    return;
                }
                if(!this.checkCarNum(this.carNum)){
                    faileHint($('.infoBox'),'请输入正确的车牌号')
                    iftrue=false;
                    return;
                }
                if(!this.carbrand){
                    faileHint($('.infoBox'),'请选择车型和颜色')
                    iftrue=false;
                    return;
                }
                if(!this.chezhuName){
                    faileHint($('.infoBox'),'请输入车主姓名')
                    iftrue=false;
                    return;
                }
                if(!this.license_time){
                    faileHint($('.infoBox'),'请选择初次领取驾照时间')
                    return;
                }
                if(!this.checkjiaTime(this.license_time_str,this.jiatime)){
                    faileHint($('.infoBox'),'请确保驾照领取时间超过'+this.jiatime+'年')
                    return;
                }
                if(!this.car_time){
                    faileHint($('.infoBox'),'请选择车辆注册日期')
                    return;
                }
                if(!this.checkcarTime(this.car_time_str,this.cartime)){
                    faileHint($('.infoBox'),'请确保车辆注册时间在'+this.cartime+'年内')
                    return;
                }
                if(vm.ifneedWangyue && !$('#wangyuep').hasClass("done")){
                    faileHint($('.infoBox'),'请上传网约车证件照')
                    return;
                }
//                        $('input[type=hidden]').each(function(){
//                            if($(this).attr('id')=='renchez_img_id' || $(this).parent().hasClass("chuan")){
//                                return;
//                            }
//                            if(!$(this).val()){
//                                iftrue=false;
//                            }
//                        })
//                        if(!iftrue){
//                            faileHint($('.infoBox'),'您有未上传的照片，请全部上传完后再提交')
//                            return;
//                        }
                if(!vm.photoId){
                    faileHint($('.infoBox'),'请上传头像');
                    return;
                }
                if(!vm.identityImgId || !vm.identityBackImgId){
                    faileHint($('.infoBox'),'请上传身份证照片');
                    return;
                }
                if(!vm.driverLicenseImgId){
                    faileHint($('.infoBox'),'请上传驾驶证照片');
                    return;
                }
                if(!vm.carLicenseImgId){
                    faileHint($('.infoBox'),'请上传行驶证照片');
                    return;
                }
                var Data={
                    register_code:rootScope.register_code,
                    city: $('#personal').val(),
                    name:vm.registerName,
                    identityCard:vm.id_card.toUpperCase(),
                    vehicleNumber:vehicleNumber.toUpperCase(),
                    vehicleOwnerName:vm.chezhuName,
                    licenseStartDate:vm.license_time,
                    carRegisterTime:vm.car_time,
                    carBrandId:vm.carBrandId,
                    carModelId:vm.carModelId,
                    carColor:vm.carColor,
                    cellphone:rootScope.cellphone,
                    carBrand:vm.carBrand
                }
                console.log(Data)
                $.ajax({
                    type: 'post',
                    url: ajaxUrl+'/Common/DriverRegister',
                    dataType: 'json',
                    data:Data,
                    success: function (data) {
                        if (data.code == 200) {
                            if(data.msg.ret_code==200){
                                window.location.href='./audiW.html'
                            }else if(data.msg.ret_code==401 || data.msg.ret_code==402 || data.msg.ret_code==601 || data.msg.ret_code==501 || data.msg.ret_code==502 || data.msg.ret_code==500){
                                faileHint($('.infoBox'),data.msg.ret_msg);
                            }else {
                                faileHint($('.infoBox'),data.msg.ret_msg);
                            }
                        } else if (data.code == 499) {
                            faileHint($('.infoBox'),data.msg.ret_msg);
                        } else{
                            faileHint($('.infoBox'),'未知错误');
                        }
                    },
                    error: function (err) {
                        faileHint($('.infoBox'),'网络异常');
                    }
                })
            },
            downloadapp:function () {
                var u = navigator.userAgent;
                var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
                var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                var link = '';
                link = 'http://d.yongche.com';
                isiOS && (link = 'https://appsto.re/cn/zwVq8.i');
                window.location.href=link;
            },
            tofix:function () {
                this.audiF=false;
                this.citySelet();
                //this.getgeolo();
                var oFailReason=rootScope.auditFailReason;
                if(typeof rootScope.auditFailReason==='string'){
                    oFailReason=JSON.parse(rootScope.auditFailReason)
                }
                for(var key in oFailReason){
                    switch(key)
                    {
                        case 'name':
                            $('#regName').css("color",'#FF5252');
                            break;
                        case 'identity':
                            $('#CardId').css({'color':'#FF5252'});
                            break;
                        case 'car_number_city':
                            $('#personal_dummy').css({'color':'#FF5252'});
                            $('.select-value2').css({'color':'#FF5252'});
                            $('.carNumclass').css({'color':'#FF5252'});
                            break;
                        case 'car_number':
                            $('.select-value2').css({'color':'#FF5252'});
                            $('.carNumclass').css({'color':'#FF5252'});
                            break;
                        case 'car_type_fail':
                            $('#carbrand').css({'color':'#FF5252'});
                            break;
                        case 'car_owner':
                            $('#carOwnerc').css({'color':'#FF5252'});
                            break;
                        case 'car_date':
                            $('#car_time').css({'color':'#FF5252'});
                            break;
                        case 'car_type':
                            $('#carbrand').css({'color':'#FF5252'});
                            break;
                        case 'driver_license_date':
                            $('#select_time').css({'color':'#FF5252'});
                            break;
                        case 'photo':
                            // $('#head1').removeAttr('disabled');
                            $('#headp').html('请重新上传');
                            $('#headp').css({'color':'#FF5252'});
                            break;
                        case 'network_driver_img':
                            // $('#fileElem1').removeAttr('disabled');
                            //  $('#fileElem2').removeAttr('disabled');
                            $('#wangyuep').html('请重新上传').removeClass("done");
                            break;
                        case 'network_transport_img':
//                                    $('#fileElem3').removeAttr('disabled');
//                                    $('#fileElem4').removeAttr('disabled');
//                                    $('#fileElem5').removeAttr('disabled');
                            $('#wangyuep').html('请重新上传').removeClass("done");
                            break;
                        case 'shuangzheng':
//                                    $('#fileElem1').removeAttr('disabled');
//                                    $('#fileElem2').removeAttr('disabled');
//                                    $('#fileElem3').removeAttr('disabled');
//                                    $('#fileElem4').removeAttr('disabled');
//                                    $('#fileElem5').removeAttr('disabled');
                            $('#wangyuep').html('请上传').removeClass("done");
                            break;
                        case 'car_front_img':
                            // $('#renchez').removeAttr('disabled');
                            $('#renchep').html('请上传').removeClass("done");
                            break;
                        case 'car_type_car_age':
                            $('#carbrand').css({'color':'#FF5252'});
                            break;
                        default:

                    }
                }
            },
            auto:function (Img) {
                var maxWidth=686;
                var maxHeight=686;
                var image = new Image();
                image.src = Img.src;
                if (image.width < maxWidth&& image.height < maxHeight) {
                    Img.width = image.width;
                    Img.height = image.height;
                }
                else  {
                    if (maxWidth/ maxHeight  <= image.width / image.height)
                    {
                        Img.width = maxWidth;
                        Img.height = maxWidth* (image.height / image.width);
                    }
                    else {
                        Img.width = maxHeight  * (image.width / image.height);
                        Img.height = maxHeight  ;
                    }
                }
            }
        }
    };
    var router = new VueRouter();
    router.map({
        '/': {
            component: Login,
            name: 'login'
        },
        "/drawinfo": {
            component: Drawinfo,
            name: 'drawinfo'
        }
    });
    var App = {};
    router.start(App, '#app');
    if(isLogin()){
        router.go({ name: 'drawinfo'});
    }else {
        router.go({ name: 'login'});
    }


}