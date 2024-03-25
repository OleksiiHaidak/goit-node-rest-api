import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const getAllContacts = async (req, res) => {
        const result = await contactsService.listContacts();
        res.json(result);
};

const getOneContact = async (req, res) => {
        const { id } = req.params;
        const result = await contactsService.getContactById(id);
        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};

const deleteContact = async (req, res) => {
        const { id } = req.params;
        const result = await contactsService.removeContact(id);
        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};

const createContact = async (req, res) => {
        const data = req.body;
        const result = await contactsService.addContact(data);
        res.status(201).json(result);
};

const updateContact = async (req, res) => {
        if (Object.keys(req.body).length === 0) {
            throw HttpError(400, "Body must have at least one field");
        }
        const { id } = req.params;
        const result = await contactsService.updContact(id, req.body);
        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};

const updateFavoriteStatus = async (req, res) => {
        const { id } = req.params;
        const { favorite } = req.body;

        if (!{favorite}) {
            throw HttpError(400, "Body must be a boolean value");
        }
        const result = await contactsService.updateStatusContact(id, { favorite });
        if (!result) {
            throw HttpError(404, "Not found");
        }
        res.json(result);
};


export default {
    getAllContacts: ctrlWrapper(getAllContacts),
    getOneContact: ctrlWrapper(getOneContact),
    deleteContact: ctrlWrapper(deleteContact),
    createContact: ctrlWrapper(createContact),
    updateContact: ctrlWrapper(updateContact),
    updateFavoriteStatus: ctrlWrapper(updateFavoriteStatus),
}