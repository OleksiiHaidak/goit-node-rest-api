import Contact from "../models/Contact.js";


const listContacts = filter => Contact.find(filter);

const addContact = data => Contact.create(data);

const getContactById = contactId => {
    const data = Contact.findOne(contactId);
    return data;
};
 
const updContact = (contactId, data) => Contact.findOneAndUpdate(contactId, data);

const removeContact = contactId => Contact.findOneAndDelete(contactId);

const updateStatusContact = (contactId, data) => Contact.findOneAndUpdate(contactId, data);


export default {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updContact,
    updateStatusContact,
}