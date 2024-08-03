// messages.js

const mockMessages = [
    {
        createdBy: "Jack Blue",
        createdOn: new Date('December 08, 2018 17:24:00'),
        channel: "channel1", 
        own: false,
        text: "What's up?"
    },
    {
        createdBy: "Emily Green",
        createdOn: new Date('December 08, 2018 17:30:00'),
        channel: "channel2", 
        own: true,
        text: "Just finished a coding session!"
    },
    {
        createdBy: "Mike Red",
        createdOn: new Date('December 09, 2018 10:00:00'),
        channel: "channel1", 
        own: false,
        text: "Morning everyone!"
    },
    {
        createdBy: "Alice Yellow",
        createdOn: new Date('December 09, 2018 12:45:00'),
        channel: "channel3", 
        own: false,
        text: "Hey, how's it going?"
    },
    {
        createdBy: "You",
        createdOn: new Date(), 
        channel: "channel2", 
        own: true,
        text: "Getting ready for the project presentation."
    }
];

export default mockMessages;
