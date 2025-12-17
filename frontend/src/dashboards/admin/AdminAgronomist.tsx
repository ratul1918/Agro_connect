import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface AdminAgronomistProps {
    agronomistForm: any;
    setAgronomistForm: (form: any) => void;
    handleAddAgronomist: (e: React.FormEvent) => void;
    agronomistMessage: string;
    loading: boolean;
}

const AdminAgronomist: React.FC<AdminAgronomistProps> = ({
    agronomistForm, setAgronomistForm, handleAddAgronomist, agronomistMessage, loading
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgronomistForm({
            ...agronomistForm,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="hero min-h-[60vh] bg-base-100 rounded-box shadow-xl animate-in zoom-in duration-300">
            <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-4xl">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold text-primary">New Expert</h1>
                    <p className="py-6">
                        Register a new certified Agronomist to the platform.
                        They will have access to expert features and can write technical blogs.
                    </p>
                    <ul className="steps steps-vertical lg:steps-horizontal w-full">
                        <li className="step step-primary">Register</li>
                        <li className="step step-primary">Verify Credentials</li>
                        <li className="step">Grant Access</li>
                    </ul>
                </div>
                <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100 border border-base-200">
                    <form className="card-body" onSubmit={handleAddAgronomist}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <Input
                                name="fullName"
                                placeholder="Dr. John Doe"
                                value={agronomistForm.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="expert@agro.com"
                                value={agronomistForm.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Phone</span>
                            </label>
                            <Input
                                name="phone"
                                placeholder="+8801..."
                                value={agronomistForm.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="******"
                                value={agronomistForm.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 w-full"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </Button>
                        </div>
                        {agronomistMessage && (
                            <div className={`alert ${agronomistMessage.includes('❌') ? 'alert-error' : 'alert-success'} mt-4 text-sm py-2`}>
                                {agronomistMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAgronomist;
