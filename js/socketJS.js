const socket = io();

socket.on('updateDonationView', (data_obj) => {
	const donation_obj = data_obj.donation_obj;
	const username = data_obj.username;
	const donationVal = data_obj.donationAmount;
	//console.log("hit")
	console.log(donation_obj.title)
	const li_var = document.getElementById(donation_obj.title);
	console.log(donation_obj.totalDonations);
	li_var.children[0].children[1].children[0].innerHTML = donation_obj.totalDonations;
	const width_percent = 100 * (donation_obj.totalDonations / donation_obj.targetDonations);
	console.log("init_percent: " + li_var.children[0].children[2].children[0].style.width);
	console.log("width_percent: " + width_percent);
	li_var.children[0].children[2].children[0].style.width = width_percent + "%";
	console.log(li_var.children[0].children[4].innerHTML);
	console.log("username: " + username);
	li_var.children[0].children[4].innerHTML = username + " has donated $" + donationVal + " to this cause!!";
	setTimeout(function(){ 
		li_var.children[0].children[4].innerHTML = "";
	}, 10000);

});
/*document.getElementById("donate").addEventListener('click', () => {
	const donationVal = document.getElementById("donationInput").value;
	socket.emit('donate',donationVal);
});*/







