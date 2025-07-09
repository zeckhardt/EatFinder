import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Form, FormGroup, Label } from 'reactstrap';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
};

const CreateListModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
            setName('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose}>
            <ModalHeader toggle={onClose}>Create New List</ModalHeader>
            <Form onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="listName">List name</Label>
                        <Input
                            id="listName"
                            type="text"
                            placeholder="List name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button color="primary" type="submit">
                        Create
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default CreateListModal;
