// Various functions that act as extensions to regular discord.js objects

"use strict";

const memberRegex = /<@!?(\d{17,20})>/;
const channelRegex = /<#(\d{17,20})>/;

module.exports.getDefaultChannel = async function (guild) {
    const messageableChannels = [];

    for (const [snowflake, channel] of guild.channels) {
        if (channel.permissionsFor(guild.me).has(`SEND_MESSAGES`)) {
            messageableChannels.push(channel);
        }
    }

    if (messageableChannels && messageableChannels.length > 0) {
        return messageableChannels[0];
    }
};

module.exports.resolveChannel = async function(channelResolvable, guild) {
    if (!(guild && channelResolvable))
        return null;

    const result = channelRegex.exec(channelResolvable);
    if (result && result[1]) {
        return guild.channels.resolve(result[1]);
    }

    let channel = guild.channels.resolve(channelResolvable);
    if (channel) {
        return channel;
    }
    channelResolvable = channelResolvable.toLowerCase();
    channel = guild.channels.find(channel => channel.name.toLowerCase() === channelResolvable);
    if (channel) {
        return channel;
    } else {
        return null;
    }
};

module.exports.resolveMember = async function(memberResolvable, guild) {
    if (!(guild && memberResolvable))
        return null;

    const result = memberRegex.exec(memberResolvable);
    if (result && result[1]) {
        return guild.members.resolve(result[1]);
    }

    let member = guild.members.resolve(memberResolvable);
    if (member) {
        return member;
    }
    memberResolvable = memberResolvable.toLowerCase();
    member = guild.members.find(member =>
        (member.user.username.toLowerCase() === memberResolvable) ||
        (member.nickname && member.nickname.toLowerCase() === memberResolvable)
    );

    if (member) {
        return member;
    } else {
        member = guild.members.find(member =>
            (member.user.username.toLowerCase().includes(memberResolvable)) ||
            (member.nickname && (member.nickname.toLowerCase().includes(memberResolvable)))
        );
        if (member) {
            return member;
        } else {
            return null;
        }
    }
};

const snowflakeIdRegex = /\d{17,20}/g;

module.exports.isSnowflakeId = async function(userID) {
    return Boolean(userID.match(snowflakeIdRegex));
};

module.exports.sendDM = async function (user, message, options) {
    const dm = user.dmChannel || await user.createDM();
    try {
        await dm.send(message, options);
    } catch (err) {
        return false;
    }

    return true;
};
