"use strict";

var postsPerPage	    = 2;
var recentPostsPerPage  = 2;
var pages			    = 1;
var menuArr		 		= getMenuArr();
var activeNumber 		= 0;
var currentPage	 		= 1;
var maxPages	 		= 20;
var maxSentenceSize	 	= 30;
var maxRecentSize 		= 10;
var postCounter  		= blogData.length;
var tagSidebarObj		= {};
var tagData				= [];
var activeView			= "main";
var activeSnippetObj 	= {};
var activeIndex			= 0;
var previousView 		= "main";
var activeTag 			= "default";
 
function changeView(view){

	activeView = view;
	
	$("#main").addClass("hidden");
	$("#snippet").addClass("hidden");
	$("#tags").addClass("hidden");
	$("#newPostLink").addClass("disabled");
	$(".ui.label.tag").removeClass("hidden");
	
 	switch(activeView){
		case "main":
			activeTag = "default";
			$("#main").removeClass("hidden");
			$("#newPostLink").removeClass("disabled");
		break;
		case "snippet":
			$("#snippet").removeClass("hidden");			
		break;
		case "tags":
			$("#tags").removeClass("hidden");			
		break;
		default:
			$("#main").removeClass("hidden");
			activeView = "main";
	}
}

$( document ).ready(function() {
	
	$("#page_1").addClass("active");
	displayPages(currentPage);
	$("#postSuccess").hide();
	clearInputFields();
	
	$('.ui.modal').modal({
		onHide: function(){
			clearColors();
			$("#postErrorMsg").addClass("hidden");
			clearInputFields();
		}
	});
	
	setTagSidebarObj(blogData);
	changeView("main");
});

function setTagSidebarObj(obj){
	
	var allTags = [];	
	var counts = {};
	
	for(var i=0; i < obj.length; i++){
		for(var j=0; j < obj[i].tags.length; j++){
			allTags.push(obj[i].tags[j]);
		}
	}
 	allTags.forEach(function(x) { counts[x] = (counts[x] || 0) + 1; });
	tagSidebarObj = counts;
	
  	Vue.set(tagsSidebarVue, "tagSidebarObj", tagSidebarObj);
}

function getMenuArr(){	
	var arr = [];		
	pages   = Math.round(blogData.length/postsPerPage);
	
	if(pages > maxPages){
		return;
	}	
	for(var i=0; i < pages; i++){
		arr.push((i+1));
	}
	return arr;
}

document.getElementById("blogDate").setAttribute("value", new Date().toLocaleDateString("en-US"));	//REFINE

Vue.component("recent-div", {
	props	: ["post"],
	template: '<div class="ui relaxed divided list">' +
			  '<div class="item">'+
			  '<div class="content">'+
			  '<a class="header recent snippet">{{post.title}}</a>'+
			  '<div class="description">{{post.date}}</div>'+
			  '</div>'+
			  '</div>'+
			  '</div>'
});
 
Vue.component("pagination-div", {
	props	: ["number"],
	template: '<a class="item">{{number}}</a>'			  
});

Vue.component("snippet-div", {
	props 	 : ["post"],	 
	template : '<form class="ui form" id="editPostForm">' +
			   '<h4 class="ui dividing header">View/Edit Post Information</h4>' +			   			   
			   '<div class="field"><label>Date</label><input id="editDate" type="text" v-model="post.date" value="{post.date}"></div>' +
'<div class="field"><label>Tags</label><input id="editTags" type="text" v-for="post.tags" v-model="post.tags"></div>' +
'<div class="field"><label>Title</label><input id="editTitle" type="text" v-model="post.title" value="{post.title}"></div>' + 
			   '<div class="field"><label>Title</label> <textarea id="editContent" v-model="post.content">{{post.content}}</textarea></div>' +
			   	'<div class="ui divider"></div>'+			   
			   '</form>'
});

Vue.component("post-div", {
	props 	 : ["post"],	 
	template : '<div class="event">' +
			   '<div class="content">' +			   			   
			   '<div class="postId hidden">{{post.id}}</div>' +
			   '<div class="date">{{post.date}}</div>' +
			   '<div   v-for="tags in post.tags" class="ui blue labels"><a class="ui label tag">{{tags}}</a></div>' +
			   '<div class="summary">{{post.title}}</div>' + 
			   '<div class="extra text"><p>{{post.content}}</p>' +
			   '<div class="more"><button class="ui primary button readMore">View/Edit</button></div></div>'+
			   '</div>'+
			   '</div>'
});
 
var tagPostsVue = new Vue({
	el: "#tagPosts",
	data: {
 			"tagData" : tagData
		  }
});

var recentPostsVue = new Vue({
	el: "#recentPosts",
	data: {
 			"blogData" : JSON.parse(JSON.stringify(blogData))
		  }
});

var tagsSidebarVue = new Vue({
	el: "#sidebarTags",
	data: {
 			"tagSidebarObj" : tagSidebarObj
		  }
});

var paginationMenuVue = new Vue({
	el: "#paginationContainer",
	data: {
		"menuArr": menuArr
	}
});

var blogVue = new Vue({
	el: "#blogPosts",
 	data: {
 			"paginationData" : paginationData
		  }
});

var snippetVue = new Vue({
	el: "#snippetPost",
	data: {
 			"activeSnippetObj" : activeSnippetObj,
			Title: "",
			TDate: "",
			Content: "",
			Tags: ""
		  },
	methods: {
		editValue : function(){
			
			this.TDate = editDate.value;
			this.Title = editTitle.value;
			this.Content = editContent.value;
			this.Tags = editTags.value;
			
			var dataCombined = [editDate, editTitle, editContent, editTags];
			var isValid 	 =  true;
			var errorMsg 	 = "";	
			
			dataCombined.forEach(function(data, index){					 
				var isEmpty = (data.value === "" ? true: false);					
				if(isEmpty){
					errorMsg += "The " + data.title + " cannot be empty.<br/>";
					isValid = false;
					$("#" + data.id).parent().addClass("error");
 				}							
			});  
			
			if(isValid){				
				var tmpTags = [];
				if(this.Tags !== undefined && this.Tags !== ""){
					
					Array.prototype.contains = function(obj) {
						this.indexOf(obj) >= 0;
					};

					tmpTags.push("default");
					var tags = this.Tags.split(",");					
					for(var i=0; i<tags.length; i++){						
						var currentTag = tags[i].toLowerCase();
						currentTag = currentTag.replace(/[^A-Za-z]+/g, "");	//removes numbers/characters
						
						if(currentTag !== " " && currentTag !== "default"){
							tmpTags.push(currentTag);
						}
					}	
				}
				
				editTags.value = editTags.value.replace(/\s/g, "");
				editTags.value = editTags.value.replace(",default", "");
			 
				activeSnippetObj.tags=tmpTags;
				activeSnippetObj.title=this.Title;
				activeSnippetObj.date=this.TDate;
				activeSnippetObj.content=this.Content;
				
 
				blogData[activeIndex] = activeSnippetObj;
				paginationData = JSON.parse(JSON.stringify(blogData));
				$("#editSuccessMsg").removeClass("hidden");	
				
				clearInputFields();
				clearObjectData(this);
				setTagSidebarObj(blogData);
				$("#page_1").click();	
				
				setTagSidebarObj(blogData);
				Vue.set(paginationMenuVue, "menuArr", menuArr);						
 				Vue.set(blogVue, "paginationData", paginationData);	
				
				Vue.set(recentPostsVue, "blogData", JSON.parse(JSON.stringify(blogData)));
				
				getTagData();
				Vue.set(tagPostsVue, "tagData", tagData);				
			}
			else{
				$("#editErrorMsg").html(errorMsg);
				$("#editErrorMsg").removeClass("hidden");
			}
		}
	}
});

$("#editDate,#editTags,#editContent,#editTitle").on("click", function(){
	$("#editSuccessMsg").addClass("hidden");		
});

var postCreateVue = new Vue({
	el: "#blogPostCreate",
	data: {
			Title    : blogTitle.value,
			TDate 	 : new Date().toLocaleDateString("en-US"),
			Content  : blogContent.value,
			Tags	 : blogTags.value
		  },
	methods: {
		createNewBlogObj : function(){
			
 			var dataCombined = [blogTitle, blogDate, blogContent];
 			var isValid 	 =  true;
			var errorMsg 	 = "";			
			 
			dataCombined.forEach(function(data, index){					 
				var isEmpty = (data.value === "" ? true: false);					
				if(isEmpty){
					errorMsg += "The " + data.title + " cannot be empty.<br/>";
					isValid = false;
					$("#" + data.id).parent().addClass("error");
 				}							
			});  
					
			if(isValid){
				var tmpTags = [];
				tmpTags.push("default");
				
				if(this.Tags !== undefined && this.Tags !== ""){
					
					var tags = this.Tags.split(",");					
					for(var i=0; i<tags.length; i++){						
						var currentTag = tags[i].toLowerCase();
						currentTag = currentTag.replace(/[^A-Za-z]+/g, "");	//remove numbers/characters
						
						if(currentTag !== " " && currentTag !== "default"){
							tmpTags.push(currentTag);
						}
					}	
				}

 				blogData.unshift( {title: this.Title, username: "DOM", tags: tmpTags, date: this.TDate, content: this.Content, id:postCounter} );
				postCounter++;
				
				$("#postErrorMsg").addClass("hidden");
				
				displayPages(currentPage);
				menuArr = getMenuArr();
				Vue.set(paginationMenuVue, "menuArr", menuArr);
				Vue.set(recentPostsVue, "blogData", JSON.parse(JSON.stringify(blogData)));	

				getTagData();
				Vue.set(tagPostsVue, "tagData", tagData);	
				
 				$(".ui.modal").modal("hide");
				$("#postSuccess").show();
				clearInputFields();
				clearObjectData(this);
 				hideSuccessPost();
				
				setTagSidebarObj(blogData);
				
				$("#page_1").click();
			}else{
				$("#postErrorMsg").html(errorMsg);
				$("#postErrorMsg").removeClass("hidden");
			}							
		}
	} 
});

function clearObjectData(obj){
	obj.Title = "";
	obj.Content = "";
	obj.Tags = "";
}

function checkEmptyStr(str){
	return str.length > 0 ? true: false;
}

function clearColors(){
	$(".field.error").removeClass("error"); 				
}
	
$(document).on("click", ".pagination .item", function(){
	resetActivePage();
	$(this).addClass("active");	
	
	var pageNumber = $(this).attr("id").split("_")[1];
	currentPage    = pageNumber;	
	
 	displayPages(pageNumber);	
});

function resetActivePage(){
	$(".pagination .item").removeClass("active");
}

function displayPages(pageNumber){
	
	var start = (pageNumber * postsPerPage) - postsPerPage; 
	var end   = start + (postsPerPage);
	
	paginationData = JSON.parse(JSON.stringify(blogData));
	paginationData = paginationData.slice(start, end);
	
	Vue.set(blogVue, "paginationData", paginationData);

	setTimeout(function(){
		truncateTextContent(postsPerPage, paginationData);	
	}, 50);	
}

function truncateTextContent(size, data){
	var finalStr = [];
	for(var i=0; i < size; i++){
 		try{			 
			$("#post_" + i).find("p").text(data[i].content)
 		}catch(e){}
	}	
		
}

$("#newPostLink").on("click", function(event){
	event.preventDefault();
	$("#postSuccess").hide();
	$(".ui.modal").modal("show");
});

function hideSuccessPost(){
	setTimeout(function(){
		$("#postSuccess").hide();
	}, 1000);
}

function clearInputFields(){
	$("#blogTitle").val("");
	$("#blogContent").val("");
	$("#blogTags").val("");
}

$("#blogTitle, #blogTags, #blogContent").on("click", function(event){
	clearColors();
	$("#postErrorMsg").addClass("hidden");
});
 
$(document).on("click", ".ui.button.readMore", function(){
	
	var parent = $(this).parent().parent().parent();
	
	if(previousView == "main"){
		var parentId = parent.parent().attr("id");	
		var index    =  parentId.split("_")[1];
		activeSnippetObj = JSON.parse(JSON.stringify(paginationData))[index]; 
	}
	else {
		var id =  Number(parent.find(".postId").text());
		var index = getCurrentIndex(id);
		activeSnippetObj = JSON.parse(JSON.stringify(blogData))[index]; 
	}
 	
	Vue.set(snippetVue, "activeSnippetObj", activeSnippetObj);
 	changeView("snippet");
	setActiveIndex();
});

function getCurrentIndex(id){
	var size = (blogData.length)-1;
	return size - id;
}
	 
 $(".ui.button.page.return").on("click", function(){	 
	 changeView("main");
	 previousView = "main";
 });
 
 $(".ui.button.snippet.return").on("click", function(){	 
	 $("#editSuccessMsg").addClass("hidden");
	 changeView(previousView);
	 
	 if(previousView === "tags"){
		 setTimeout(function(){
			$(".ui.label.tag").addClass("hidden");	 
		 },50);		 
	 }
 });
 
 function setActiveIndex(){
	 var activeId = activeSnippetObj.id;
	 for(var i=0; i < blogData.length; i++){
		 if(blogData[i].id == activeId){
			 activeIndex = i;
			 break;
		 }
	 }
 }
 
$(".header.recent.snippet") .on("click", function(){
	
	var parentId = $(this).parents()[2].getAttribute("id");
	var index    =  (parentId.split("_")[1]);
	
	activeSnippetObj = JSON.parse(JSON.stringify(blogData))[index]; 
	Vue.set(snippetVue, "activeSnippetObj", activeSnippetObj);
 	changeView("snippet");	
	activeIndex = index;
});

$(document).on("click", ".ui.label.tag", function(){
	
	var tag = $(this).text();
	var index = tag.indexOf("(");
	
	if(index >=0 ){
		tag = tag.slice(0, index).replace(/\s/g, "");
	}
	
	previousView = "tags";
	activeTag = tag;
	getTagData();
	Vue.set(tagPostsVue, "tagData", tagData);

	setTimeout(function(){
		changeView("tags");	
		$(".ui.label.tag").addClass("hidden");
		truncateTextContent(tagData.length, tagData);	
	},50);
});

function getTagData(){
	
	var tmpObj = [];	
	for(var i=0; i < blogData.length; i++){		
		for(var j=0; j < blogData[i].tags.length; j++){
			var tag = blogData[i].tags[j];			
			if(tag === activeTag){
				tmpObj.push(JSON.parse(JSON.stringify(blogData[i])));
			}
		}
	}
	
	console.log(activeTag);
	tagData = tmpObj;
}
