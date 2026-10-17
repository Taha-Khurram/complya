require('dotenv').config()
const { MailSlurp } = require('mailslurp-client')

// Created on first use, so tests that never touch email don't need the key
let client
const getClient = () => {
  if (!process.env.MAILSLURP_API_KEY) {
    throw new Error('MAILSLURP_API_KEY is missing from .env')
  }
  client ??= new MailSlurp({ apiKey: process.env.MAILSLURP_API_KEY })
  return client
}

// Returns { id, emailAddress }
const createInbox = () => getClient().createInbox()

const deleteInbox = (inboxId) => getClient().deleteInbox(inboxId)

// Waits until an unread email arrives, or throws after `timeout` ms
const waitForLatestEmail = (inboxId, timeout = 60000) =>
  getClient().waitForLatestEmail(inboxId, timeout, true)

const sendEmail = (inboxId, options) => getClient().sendEmail(inboxId, options)

// All links in the email body, parsed by MailSlurp
const extractLinks = async (email) =>
  (await getClient().emailController.getEmailLinks({ emailId: email.id })).links

// First match of `pattern` in the body, e.g. a 6-digit OTP
const extractCode = (email, pattern = /\b\d{6}\b/) => email.body.match(pattern)?.[0]

module.exports = { createInbox, deleteInbox, waitForLatestEmail, sendEmail, extractLinks, extractCode }
