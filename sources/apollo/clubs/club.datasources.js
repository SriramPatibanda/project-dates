/** @format */

const Clubs = require('./club.model.js');
const Users = require('../users/user.model.js');
const Events = require('../events/event.model.js');
const AccessLevel = require('../accessLevels/accessLevel.model.js');
const { DataSource } = require('apollo-datasource');
const AccessLevelAPI = require('../accessLevels/accessLevel.datasources.js');
const { INVALID_INPUT } = require('../../errors/index.js');

class ClubAPI extends DataSource {
	constructor() {
		super();
	}
	initialize(config) {}
	// async getClubs(args) {
	// 	const ans = await Clubs.find(args);
	// 	return ans;
	// }
	getClubById(id) {
		return Clubs.findById(id);
	}

	async resolveClubEvents(eventArray) {
		return await Events.find({
			_id: { $in: eventArray },
		});
	}

	async addClub(club) {
		let retPromise = {};
		// Create club with basic types;
		let createdClub = await Clubs.create({
			clubName: club.clubName,
			facAd: club.facAd,
			description: club.description,
			theme:club.theme,
			society: club.society,
			domain: club.domain,
			links: club.links,			
			contactInfo: club.contactInfo
		});

		// //Add nested types
		// const clubId = createdClub._id;
		// const accessArray = club.memberAccess;
		// const AccessLevels = new AccessLevelAPI();
		// if (accessArray != undefined && accessArray.length > 0) {
		// 	await Promise.all(
		// 		accessArray.map(async (accessItem, index) => {
		// 			accessItem.club=clubId;
		// 			await AccessLevels.addAccessLevel(accessItem);
		// 		})
		// 	);
		// }

		// const eventsArray = club.events;
		// if (eventsArray != undefined && eventsArray.length > 0) {
		// 	await Promise.all(
		// 		eventsArray.map(async (eventItem, index) => {
		// 			const eventId = eventItem;
		// 			const foundEvent = await Events.findById(eventId);
		// 			createdClub.events.push(foundEvent._id);
		// 			foundEvent.Organizer = clubId;
		// 			await foundEvent.save();
		// 		})
		// 	);
		// }
		retPromise = await createdClub.save();
		return retPromise;
	}

	async updateClub(args) {
		const clubId = args.id;
		const club = args.club;
		let retPromise = {};
		let foundClub;
		try{
			foundClub = await Clubs.findById(clubId);
			if(foundClub==undefined){
				return {...INVALID_INPUT, message:"Club Not Found"};
			}
		}catch(e){
			return {...INVALID_INPUT, message:e.message};
		}
		let updatedClub = new Clubs(foundClub);
		updatedClub = Object.assign(updatedClub, club);
		updatedClub = new Clubs(updatedClub);

		//Add nested types
		// const accessArray = club.memberAccess;
		// const AccessLevels = new AccessLevelAPI();
		// if (accessArray != undefined && accessArray.length > 0) {
		// 	// accessArray exists and not empty
		// 	await Promise.all(
		// 		accessArray.map(async (accessItem, index) => {
		// 			const userId = accessItem.user;
		// 			const foundUser = await Users.findById(userId);
		// 			const foundAccessObj=await AccessLevel.findOne({user:userId,club:foundClub._id});
		// 			//Check if there is no such access level defined
		// 			if(foundAccessObj==undefined){
		// 				accessItem.club=clubId;
		// 				await AccessLevels.addAccessLevel(accessItem);
		// 			}
		// 			else{
		// 				await  AccessLevels.updateAccessLevel(accessItem);
		// 			}
		// 		})
		// 	);
		// }

		// const eventsArray = club.events;
		// if (eventsArray != undefined && eventsArray.length > 0) {
		// 	// eventsArray exists and not empty
		// 	await Promise.all(
		// 		eventsArray.map(async (eventItem, index) => {
		// 			const eventId = eventItem;
		// 			const foundEvent = await Events.findById(eventId);
		// 			updatedClub.events.push(foundEvent._id);
		// 			foundEvent.Organizer = clubId;
		// 			await foundEvent.save();
		// 		})
		// 	);
		// }
		retPromise = await updatedClub.save();
		return retPromise;
	}

	async deleteClub(id) {		
		let foundClub;
		try{
			foundClub = await Clubs.findById(id);
			if(foundClub==undefined){
				return {...INVALID_INPUT, message:"Club Not Found"};
			}
		}catch(e){
			return {...INVALID_INPUT, message:e.message};
		}
		
		const accessArray = foundClub.memberAccess;
		const AccessLevels = new AccessLevelAPI();
		// accessArray exists and not empty
		await Promise.all(
			accessArray.map(async (accessItem, index) => {
				await AccessLevels.deleteAccessLevelFromUser(accessItem);
			})
		);		
		await foundClub.deleteOne();
		return {success:true};
	}
}

module.exports = ClubAPI;