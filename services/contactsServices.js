import Contact from "../models/Contact.js";


const listContacts = () => Contact.find();

const addContact = data => Contact.create(data);

const getContactById = contactId => {
    const data = Contact.findById(contactId);
    return data;
};
 
const updContact = (contactId, data) => Contact.findByIdAndUpdate(contactId, data);

const removeContact = contactId => Contact.findByIdAndDelete(contactId);

const updateStatusContact = (contactId, data) => Contact.findByIdAndUpdate(contactId, data);


export default {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updContact,
    updateStatusContact,
}