import React from 'react';
import { FadeUp, ScaleIn } from '../ui/AnimatedElements';
import { GoldHeading, GoldDivider } from '../ui/GoldAccents';

export const GoldContactFormExample: React.FC = () => {
  return (
    <section className="py-20 relative gold-section">
      <div className="absolute inset-0 gold-dots opacity-[0.03] pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <ScaleIn>
              <GoldHeading 
                as="h2" 
                className="text-3xl md:text-5xl font-display font-bold text-white mb-4"
                withAccent
              >
                Let's Connect
              </GoldHeading>
            </ScaleIn>
            
            <FadeUp delay={0.2}>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Ready to discuss your vision? Reach out and let's create something beautiful together.
              </p>
            </FadeUp>
          </div>
          
          <GoldDivider className="mb-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <FadeUp className="gold-glass p-6 rounded-xl h-full">
                <h3 className="text-xl font-semibold text-gold-light mb-4">Contact Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <a href="mailto:hello@example.com" className="gold-link">
                      hello@example.com
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                    <a href="tel:+1234567890" className="gold-link">
                      +1 (234) 567-890
                    </a>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Address</p>
                    <address className="text-white not-italic">
                      123 Photography Lane<br />
                      Creative District<br />
                      City, ST 12345
                    </address>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm text-gray-400 mb-2">Follow Me</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-white hover:text-gold-light transition-colors">
                        Instagram
                      </a>
                      <a href="#" className="text-white hover:text-gold-light transition-colors">
                        Twitter
                      </a>
                      <a href="#" className="text-white hover:text-gold-light transition-colors">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
            
            <div className="md:col-span-3">
              <FadeUp delay={0.2} className="gold-glass-light p-6 rounded-xl">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="gold-input w-full px-4 py-3 rounded-lg"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="gold-input w-full px-4 py-3 rounded-lg"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <select id="subject" className="gold-input gold-select w-full px-4 py-3 rounded-lg">
                      <option value="">Select a subject</option>
                      <option value="booking">Photography Booking</option>
                      <option value="collaboration">Collaboration Request</option>
                      <option value="question">General Question</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="gold-input w-full px-4 py-3 rounded-lg"
                      placeholder="Your message"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" className="admin-button-gold w-full px-6 py-3 rounded-lg">
                      Send Message
                    </button>
                  </div>
                </form>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoldContactFormExample; 