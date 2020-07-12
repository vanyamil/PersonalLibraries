/******************************************************************************

A Splitter is a text-parsing class, and in a basic way mimics some languages'
`explode` function. The IterativeSplitter version is a lazy approach to it,
using token-by-token parsing. This version could potentially parse a small part
of a very large string and stop without using too much memory and parsing time.

This was written as a challenge at my job at Dash Computer Solutions 
https://daqc.com

*******************************************************************************/

#include <iostream>
#include <vector>

using namespace std;

inline int inrange(int num, int min, int max)
{
    return num >= min && num <= max;
}

#define SPLITTER_DEFAULT            0
#define SPLITTER_LRTRIM             (1 << 0)    //!< If enabled, white space surrounding the separator will be removed.
#define SPLITTER_KEEPEMPTYSTRING    (1 << 1)    //!< If enabled, parsing an empty string results in 1 string of 0 length as opposed to 0 strings.
#define SPLITTER_SKIPHTMLENTITIES   (1 << 2)    //!< If enabled, the semi-colons associated with &# style html entities will not count as separators (only makes sense to use if separator is semi-colon) 

/// A const forward iterator for splitting a string on its separator.
class ISIterator : public iterator<forward_iterator_tag, string>
{
private:
    static const ISIterator END_IT; // Default constructor makes a past-the-end iterator
    
    static const size_t END = -1;
    
    const string original;              //!< String that gets divided
    const char separator;               //!< Character by which original is separated
    const int mask;                     //!< Options mask
    
    string current;                     //!< Current token
    size_t start_idx, end_idx, num;     //!< Control indexes

    void findEndWithLoopOnHTML() {
        // Extra parameters to allow HTML logic
        bool try_again = false;
        int temp_start = start_idx;

        // This loop will only run once if not using HTML mask
        do {
            // Move end
            end_idx = original.find(separator, temp_start);
            
            // HTML logic
            if(mask & SPLITTER_SKIPHTMLENTITIES) {
                // Check if ';' is a hex entity
                size_t hex_start = original.rfind("&#", end_idx);
                if(hex_start != string::npos) { // Did find a hex code
                    hex_start += 2;
                    bool is_hex = original[hex_start] == 'x';
                    if(is_hex) // Move over
                        ++hex_start;
                    
                    // Seek until end_idx, expecting only digits or hex letters if hex
                    while(hex_start != end_idx) {
                        char c = original[hex_start];
                        if(isdigit(c) || (is_hex && (inrange(c, 'a', 'f') || inrange(c, 'A', 'F'))))
                            hex_start++;
                        else
                            break;
                    }
                    
                    try_again = hex_start == end_idx;
                    temp_start = end_idx + 1;
                }
            }
        } while(try_again);
    }
    
public:
    /// Default constructor
    ISIterator() : num(END), original(), separator(), mask() {}
    
    /// Copy constructor
    ISIterator(const ISIterator &other) : 
        original(other.original),
        start_idx(other.start_idx),
        end_idx(other.end_idx),
        num(other.num),
        mask(other.mask),
        separator(other.separator),
        current(other.current)
    {}
    
    /// Actual constructor
    ISIterator(const string original0, const char sep0, const int mask0 = 0) :
        original(original0),
        separator(sep0),
        mask(mask0),
        start_idx(END),
        end_idx(END),
        num(END)
    {
        // If the string is empty and we don't want to keep empty (blank iterator), 
        // just set to past-the-end
        if(original0.size() == 0 && !(mask & SPLITTER_KEEPEMPTYSTRING))
            start_idx = 0;
        operator++(); 
    }
    
    // Equality test
    bool operator==(const ISIterator &rhs) 
    { 
        if(num == END)
            return rhs.num == END;          // All end iterators are equal
        
        return original == rhs.original     // Dividing same string
            && separator == rhs.separator   // By same separator
            && mask == rhs.mask             // Using same mode
            && num == rhs.num;              // And currently at same position
    }
    
    // Inequality test
    bool operator!=(const ISIterator &rhs)
    {
        return !(operator==(rhs));
    }
    
    // Dereference element
    const string& operator*()
    {
        return current;
    }
    
    // Post-increment
    ISIterator operator++(int) 
    {
        ISIterator tmp(*this); 
        operator++(); 
        return tmp;
    }
    
    // Pre-increment / find next
    ISIterator& operator++() 
    {
        if(end_idx == string::npos && start_idx != END) { // Reached the end last time
            num = END;
            // Not worrying about fixing current since you should not be dereferencing a past-the-end iterator
            return *this;
        }
        
        // Move start
        start_idx = end_idx+1;
        
        // left trim logic
        if(mask & SPLITTER_LRTRIM)
            while(original[start_idx] == ' ' || original[start_idx] == '\t')
                start_idx++;

        findEndWithLoopOnHTML();
        
        // Right trim logic
        int true_end = end_idx - 1;
        if(mask & SPLITTER_LRTRIM)
            while(true_end >= start_idx && (original[true_end] == ' ' || original[true_end] == '\t'))
                true_end--;
        
        // Regenerate current token
        current = original.substr(start_idx, (++true_end) - start_idx);
        
        num++;
        
        return *this;
    }
    
    static const ISIterator& end() { return END_IT; }
};

const ISIterator ISIterator::END_IT = ISIterator();

// Wrapping splitter class

class IterativeSplitter
{
private:
    const string original;              //!< String that gets divided
    const char separator;               //!< Character by which original is separated
    const int mask;                     //!< Options mask
    
public:
    typedef ISIterator iterator;
    
    /// Actual constructor
    IterativeSplitter(const string original0, const char sep0, const int mask0 = 0) :
        original(original0),
        separator(sep0),
        mask(mask0)
    {}
    
    iterator begin() { 
        iterator output(original, separator, mask); // Could be replaced by a pointer this
        return output;
    }
    
    iterator end() { return iterator::end(); }
};

// How would current splitter work?

class Splitter : public vector<string> {
public:
    Splitter(const string original0, const char sep0, const int mask0 = 0) {
        IterativeSplitter is(original0, sep0, mask0);
        for(IterativeSplitter::iterator it = is.begin(); it != is.end(); ++it) {
            push_back(*it);
        }
    }
};

int main()
{
    IterativeSplitter s(" A&#64; ; &#x13F; ; C;&#A;", ';', SPLITTER_LRTRIM | SPLITTER_SKIPHTMLENTITIES);
    int i = 0;
    for(IterativeSplitter::iterator it = s.begin(); it != s.end(); ++it, ++i) {
        cout << i << " " << *it << endl;
    }
    
    cout << "-------" << endl;
    
    i = 0;
    for(string str : s)
        cout << (i++) << " " << str << endl;

    return 0;
}
